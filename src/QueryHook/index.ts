import { useContext, useMemo, useState, useEffect } from 'react'
import { QueryContext, QueryManager } from '../Provider'
import { Queries, Status, RecordData } from 'orbit-query-manager'

export interface UseQueryOptions {
  fetch?: boolean
}

function useGetInititialState (manager: QueryManager, queries: Queries, options: UseQueryOptions = {}) {
  return useMemo(() => {
    if (options.fetch) {
      return manager.query(queries)
    }

    return manager.queryCache(queries)
  }, [queries])
}

export function useOrbit (queries: Queries, options?: UseQueryOptions) {
  const manager = useContext(QueryContext)
  const initialState = useGetInititialState(manager, queries, options)
  const [state, listener] = useState<[RecordData, Status]>(initialState)

  useEffect(() => manager.subscribe(queries, listener), [])

  return state
}