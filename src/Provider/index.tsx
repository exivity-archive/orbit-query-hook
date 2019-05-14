import React, { createContext } from 'react'
import { QueryManager } from 'orbit-query-manager'
import Store from '@orbit/store'
import { Schema } from '@orbit/data';

export const QueryContext = createContext<QueryManager>(new QueryManager(new Store({ schema: new Schema() })))

export interface Provider {
  value: QueryManager
  children: any
}

const QueryProvider = ({ value, children }: Provider) => (
  <QueryContext.Provider value={value}>
    {children}
  </QueryContext.Provider>
)

export {
  QueryManager,
  QueryProvider
}
