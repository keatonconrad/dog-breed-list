import Pagination from '@mui/material/Pagination';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo, useState } from 'react';

interface Breed {
  breed: string;
  image: string | null;
}

type Response = Breed[] | { error: string };

const PAGE_SIZE = 15;
const MAX_PAGES = 26;

export const BreedList = () => {
  const [page, setPage] = useState(1); // Page the user selects
  const [queryPage, setQueryPage] = useState(1); // Page the query is on
  const [results, setResults] = useState<Breed[]>([]);

  const query = useQuery({
    queryKey: ['breeds', page, queryPage],
    queryFn: async () => {
      const { data } = (await axios.get(
        `http://localhost:8080?page=${queryPage}`
      )) as {
        data: Response;
      };
      if ('error' in data) {
        throw new Error(data.error);
      }
      setQueryPage(queryPage + 1);
      console.log(data);
      setResults((prev) => [...prev, ...data]);
      return data;
    },
    retry: true,
    retryDelay: 500,
    enabled: results.length < page * PAGE_SIZE && queryPage <= MAX_PAGES,
  });

  const { paginatedResults, currentPageResults } = useMemo(() => {
    const paginatedResults = Array.from(
      new Array(Math.ceil(results.length / PAGE_SIZE)),
      (_, i) => results.slice(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE)
    );
    const currentPageResults = paginatedResults[Math.max(page - 1, 0)];
    return { paginatedResults, currentPageResults };
  }, [results, page]);

  return (
    <div className="w-1/2 flex flex-col space-y-8">
      {query.isLoading && (
        <div className="space-y-2">
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-4 items-center">
              <div className="rounded bg-gray-300 h-10 w-10" />
              <div className="h-4 bg-gray-300 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}
      {query.isError && <p>Error: {query.error.message}</p>}
      {!query.isLoading && paginatedResults.length > 0 && currentPageResults ? (
        <ul className="space-y-2">
          {currentPageResults.map((breed: Breed) => (
            <li key={breed.breed} className="flex items-center space-x-4">
              <p>{results.indexOf(breed) + 1}.</p>
              <img
                src={breed.image || 'https://via.placeholder.com/40'}
                alt={breed.breed}
                width={40}
                height={40}
                className="rounded"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/40';
                }}
              />
              <p>{breed.breed}</p>
            </li>
          ))}
        </ul>
      ) : null}
      <Pagination
        count={Math.floor((MAX_PAGES * 7) / PAGE_SIZE)}
        color="primary"
        page={page}
        shape="rounded"
        showLastButton={false}
        showFirstButton
        onChange={(_, value) => setPage(value)}
      />
    </div>
  );
};
