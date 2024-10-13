import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo, useState } from 'react';

interface Breed {
  breed: string;
  image: string | null;
}

type Response = Breed[] | { error: string };

const PAGE_SIZE = 15;
const API_PAGE_SIZE = 7;

export const BreedList = () => {
  const [page, setPage] = useState(1); // Page the user selects
  const [queryPage, setQueryPage] = useState(1); // Page the query is on
  const [results, setResults] = useState<Breed[]>([]);
  const [maxPage, setMaxPage] = useState(Infinity);

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
      if (data.length < API_PAGE_SIZE) {
        setMaxPage(page);
      } else {
        setQueryPage(queryPage + 1);
      }
      setResults((prev) => [...prev, ...data]);
    },
    retry: true,
    retryDelay: 500,
    enabled: results.length < page * PAGE_SIZE && queryPage > 0,
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
    <div className="w-3/4 flex flex-col space-y-8">
      {query.isLoading && (
        <div className="space-y-2">
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex space-x-4 items-center min-h-[50px]"
            >
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
            <li
              key={breed.breed}
              className="grid grid-cols-[5%,95%] items-center"
            >
              <p>{results.indexOf(breed) + 1}.</p>
              <div className="flex items-center space-x-4 min-h-[50px]">
                <img
                  src={breed.image || 'https://via.placeholder.com/50'}
                  alt={breed.breed}
                  width={50}
                  height={50}
                  className="rounded"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/50';
                  }}
                />
                <p>{breed.breed}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex justify-center">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          type="button"
          disabled={page === 1}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l disabled:opacity-80 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <span className="flex items-center justify-center w-10 bg-blue-500 text-white font-bold py-2 px-4">
          {page}
        </span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          type="button"
          disabled={page === maxPage}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r disabled:opacity-80 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
