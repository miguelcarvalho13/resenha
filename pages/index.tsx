import type { NextPage } from 'next'
import useSWR from 'swr'

const fetcher = (...args: [RequestInfo, RequestInit | undefined]) => fetch(...args).then((res) => res.json())

const Home: NextPage = () => {
  const { data, error } = useSWR('/api/categories', fetcher)

  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>
  return (
    <div>
      <ul>
        {data.categories.map(() => <li></li>)}
      </ul>
    </div>
  )
}

export default Home
