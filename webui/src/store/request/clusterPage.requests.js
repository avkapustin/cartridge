// @flow
import graphql from 'src/api/graphql';
import rest from 'src/api/rest';
import { getClusterSelf } from 'src/store/request/app.requests';
import {
  bootstrapMutation,
  changeFailoverMutation,
  editTopologyMutation,
  listQuery,
  listQueryWithoutStat,
  probeMutation,
  serverStatQuery
} from './queries.graphql';
import type { EditTopologyMutationVariables } from 'src/generated/graphql-typing'

const filterServerStat = response => {
  const serverStat
    = response.serverStat.filter(stat => stat.uuid && stat.statistics && !Array.isArray(stat.statistics));
  return {
    ...response,
    serverStat
  };
};

export function getPageData() {
  return graphql.fetch(listQuery)
    .then(filterServerStat);
}

/**
 * @param {Object} [params]
 * @param {string} [params.shouldRequestStat]
 */
export function refreshLists(params = {}) {
  const graph = params.shouldRequestStat ? listQuery : listQueryWithoutStat;
  return graphql.fetch(graph)
    .then(params.shouldRequestStat ? filterServerStat : null);
}

export function getServerStat() {
  return graphql.fetch(serverStatQuery)
    .then(filterServerStat);
}

export function bootstrapVshard() {
  return graphql.mutate(bootstrapMutation);
}

/**
 * @param {Object} params
 * @param {string} params.uri
 */
export function probeServer(params) {
  return graphql.mutate(probeMutation, params);
}

type JoinServerArgs = {
  uri: string,
  uuid: string
};

export function joinServer({ uri, uuid }: JoinServerArgs) {
  const mutationVariables: EditTopologyMutationVariables = {
    replicasets: [
      { uuid, join_servers: [{ uri }] }
    ]
  };

  return graphql.mutate(editTopologyMutation, mutationVariables);
}

type CreateReplicasetArgs = {
  alias: string,
  roles: [string],
  uri: string,
  vshard_group: string,
  weight: number
};

export function createReplicaset(
  {
    alias,
    roles,
    uri,
    vshard_group,
    weight
  }: CreateReplicasetArgs
) {
  const mutationVariables: EditTopologyMutationVariables = {
    replicasets: [
      {
        alias,
        roles,
        vshard_group,
        weight,
        join_servers: [{ uri }]
      }
    ]
  };

  return graphql.mutate(editTopologyMutation, mutationVariables);
}

type ExpelServerArgs = {
  uuid: string
};

export function expelServer({ uuid }: ExpelServerArgs) {
  const mutationVariables: EditTopologyMutationVariables = {
    servers: [
      { uuid, expelled: true }
    ]
  };

  return graphql.mutate(editTopologyMutation, mutationVariables);
}

type EditReplicasetArgs = {
  alias: string,
  master: [string],
  roles: [string],
  uuid: string,
  vshard_group: string,
  weight: number
};

export function editReplicaset(
  {
    alias,
    master,
    roles,
    uuid,
    vshard_group,
    weight
  }: EditReplicasetArgs
) {
  const mutationVariables: EditTopologyMutationVariables = {
    replicasets: [
      {
        alias,
        failover_priority: master,
        roles,
        uuid,
        vshard_group,
        weight
      }
    ]
  };

  return graphql.mutate(editTopologyMutation, mutationVariables);
}

export async function uploadConfig(params) {
  return rest.put(process.env.REACT_APP_CONFIG_ENDPOINT, params.data, {
    headers: { 'Content-Type': 'application/yaml;charset=UTF-8' }
  });
}

/**
 * @param {Object} params
 * @param {boolean} params.enabled
 */
export async function changeFailover(params) {
  const changeFailoverResponse = await graphql.mutate(changeFailoverMutation, params);
  const clusterSelfResponse = await getClusterSelf();
  return {
    changeFailoverResponse: {
      changeFailover: changeFailoverResponse,
      clusterSelf: clusterSelfResponse
    }
  };
}

// /**
//  * @param {Object} params
//  * @param {boolean} params.enabled
//  */
// export async function changeFailover(params) {
//   const graph = `
//     mutation (
//       $enabled: Boolean!,
//     ) {
//       cluster {
//         failover(
//           enabled: $enabled
//         )
//       }
//     }`;
//   const changeFailoverResponse = await graphql.fetch(graph, params);
//   const clusterSelfResponse = await getClusterSelf();
//   return {
//     changeFailoverResponse: {
//       changeFailover: changeFailoverResponse,
//       clusterSelf: clusterSelfResponse,
//     },
//   };
// }
