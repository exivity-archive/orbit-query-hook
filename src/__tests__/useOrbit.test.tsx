import React from 'react'
import { renderHook, act } from 'react-hooks-testing-library'

import { useOrbit } from '../QueryHook'
import { QueryProvider } from '../Provider'
import { QueryManager } from 'orbit-query-manager'
import { ModelDefinition, Schema, QueryBuilder, TransformBuilder } from '@orbit/data'
import { Dict } from '@orbit/utils'
import Store from '@orbit/store';

const modelDefenition: Dict<ModelDefinition> = {
  account: {
    attributes: {
      test: { type: 'string' }
    },
    relationships: {
      profile: { type: 'hasOne', inverse: 'account', model: 'profile' },
      services: { type: 'hasMany', inverse: 'subscribers', model: 'service' }
    }
  },
  profile: {
    attributes: {
      test: { type: 'string' }
    },
    relationships: {
      account: { type: 'hasOne', inverse: 'profile', model: 'account' }
    }
  },
  service: {
    attributes: {
      test: { type: 'string' }
    },
    relationships: {
      subscribers: { type: 'hasMany', inverse: 'services', model: 'account' }
    }
  }
}

const store = new Store({
  schema: new Schema({ models: modelDefenition })
})

const Wrapper = ({ children }: any) => <QueryProvider value={manager}>{children}</QueryProvider>

let manager: QueryManager
beforeEach(() => {
  manager = new QueryManager(store.fork())
})


test('Making a query without fetching will fetch directly from the cache', async (done) => {
  const account = { type: 'account', id: '1' }

  await manager._store.update(t => t.addRecord(account))

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }

  const { result } = renderHook(() => useOrbit(query), { wrapper: Wrapper })

  expect(result.current).toMatchObject([{ Account: account }, { error: null }])
  done()
})

test('Making a query with fetching will return only the status', async (done) => {
  const account = { type: 'account', id: '1' }

  await manager._store.update(t => t.addRecord(account))

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }

  const { result } = renderHook(() => useOrbit(query, { fetch: true }), { wrapper: Wrapper })
  expect(result.current).toMatchObject([null, { error: null, loading: true }])
  done()
})

test('Component updates when cache gets changed', async (done) => {
  const account = { type: 'account', id: '1' }

  await manager._store.update(t => t.addRecord(account))

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }

  const { result, waitForNextUpdate } = renderHook(() => useOrbit(query), { wrapper: Wrapper })

  act(() => { manager._store.update((t: TransformBuilder) => [t.replaceRecord(account)]) })

  waitForNextUpdate().then(() => {
    expect(result.current).toMatchObject([{ Account: account }, { error: null }])
    done()
  })
})
