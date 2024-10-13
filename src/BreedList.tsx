import Pagination from '@mui/material/Pagination';
import { useQuery } from '@tanstack/react-query';


export const BreedList = () => {
    const query = useQuery({
        queryKey: ['breeds'],
        queryFn: async () => {
            const response = await fetch('https://dog.ceo/api/breeds/list/all')
            const data = await response.json()
            return data.message
        },
        retry: true,
    })

    return (
        <div className="">
            My list is here
            <Pagination count={10} color="primary" onChange={(e, page) => console.log(page)} />
        </div>
    )
}