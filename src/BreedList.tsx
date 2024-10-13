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
    enabled: results.length < page * PAGE_SIZE,
  });

  const { paginatedResults, currentPageResults } = useMemo(() => {
    const paginatedResults = Array.from(
      new Array(Math.ceil(results.length / PAGE_SIZE)),
      (_, i) => results.slice(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE)
    );
    const currentPageResults = paginatedResults[Math.max(page - 1, 0)];
    return { paginatedResults, currentPageResults };
  }, [results]);

  return (
    <div className="">
      {query.isLoading && <p>Loading...</p>}
      {query.isError && <p>Error: {query.error.message}</p>}
      {!query.isLoading &&
      paginatedResults.length > 0 &&
      currentPageResults &&
      currentPageResults.length === PAGE_SIZE ? (
        <ul className="space-y-2">
          {currentPageResults.map((breed: Breed) => (
            <li key={breed.breed} className="flex items-center space-x-4">
              {breed.image ? (
                <img
                  src={breed.image}
                  alt={breed.breed}
                  width={40}
                  height={40}
                  className="rounded"
                />
              ) : (
                <div className="bg-gray-400 w-10 h-10 rounded" />
              )}
              <p>{breed.breed}</p>
            </li>
          ))}
        </ul>
      ) : null}
      <Pagination
        count={10}
        color="primary"
        page={page}
        onChange={(_, value) => setPage(value)}
      />
    </div>
  );
};
