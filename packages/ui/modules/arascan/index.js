// Copyright 2021 Rantai Nusantara Foundation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import axios from "axios";

class ApiService {
    setBaseUrl(baseURL) {
        this.apiClient = axios.create({
            baseURL: baseURL,
            headers: {
                "Content-type": "application/json",
            },
        });
    }

    getStats() {
        return this.apiClient.get("/stats");
    }

    getAccounts(params) {
        let query = '';
        let limit = 5;
        if (params != undefined) {
            if (params.search != undefined) {
                query += '&search=' + params.search;
            }

            if (params.limit != undefined) {
                query += '&limit=' + params.limit;
            } else {
                query += '&limit=' + limit;
            }
        }
        return this.apiClient.get(`/accounts?${query}`);
    }

    getAccount(addr) {
        return this.apiClient.get(`/account/${addr}`);
    }

    getAccountTransfers(addr) {
        return this.apiClient.get(`/account/${addr}/transfers`);
    }

    getAccountStakingTxs(addr) {
        return this.apiClient.get(`/account/${addr}/staking_txs`);
    }

    getAccountRewardSlashes(addr) {
        return this.apiClient.get(`/account/${addr}/rewards_slashes`);
    }

    getBlocks(params) {
        let query = '';
        let limit = 5;
        if (params != undefined) {
            if (params.limit != undefined) {
                query += '&limit=' + params.limit;
            } else {
                query += '&limit=' + limit;
            }
        }
        return this.apiClient.get(`/blocks?${query}`);
    }

    getBlock(block) {
        return this.apiClient.get(`/block/${block}`);
    }

    getEvents(params) {
        let query = '';
        let limit = 5;
        if (params != undefined) {
            if (params.search != undefined) {
                query += '&search=' + params.search;
            }

            if (params.limit != undefined) {
                query += '&limit=' + params.limit;
            } else {
                query += '&limit=' + limit;
            }
        }

        return this.apiClient.get(`/events?${query}`);
    }

    getToken() {
        return this.apiClient.get("/token");
    }

    getOrganizations(params) {
        let query = '';
        let limit = 5;
        if (params != undefined) {
            if (params.search != undefined) {
                query += '&search=' + params.search;
            }

            if (params.limit != undefined) {
                query += '&limit=' + params.limit;
            } else {
                query += '&limit=' + limit;
            }
        }

        return this.apiClient.get(`/organizations?${query}`);
    }

    getOrganization(addr) {
        return this.apiClient.get(`/organization/${addr}`);
    }

    getTransfers(addr, params) {
        let query = '';
        let limit = 5;
        if (params != undefined) {
            if (params.search != undefined) {
                query += '&search=' + params.search;
            }

            if (params.limit != undefined) {
                query += '&limit=' + params.limit;
            } else {
                query += '&limit=' + limit;
            }
        }

        return this.apiClient.get(`/transfers/${addr}?${query}`);
    }
}
  
export default new ApiService();
