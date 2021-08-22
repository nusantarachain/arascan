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
import axios, { AxiosInstance } from "axios";

const ARA_API_URL = process.env.ARA_API_URL || 'http://127.0.0.1:8089';

const apiClient: AxiosInstance = axios.create({
    baseURL: ARA_API_URL,
    headers: {
        "Content-type": "application/json",
    },
});

class ApiService {
    getStats(): Promise<any> {
        return apiClient.get("/stats");
    }

    getAccounts(): Promise<any> {
        return apiClient.get("/accounts");
    }

    getAccount(addr: any): Promise<any> {
        return apiClient.get(`/account/${addr}`);
    }

    getAccountTransfers(addr: any): Promise<any> {
        return apiClient.get(`/account/${addr}/transfers`);
    }

    getAccountStakingTxs(addr: any): Promise<any> {
        return apiClient.get(`/account/${addr}/transfers`);
    }

    getAccountRewardSlashes(addr: any): Promise<any> {
        return apiClient.get(`/account/${addr}/transfers`);
    }

    getBlocks(): Promise<any> {
        return apiClient.get("/blocks");
    }

    getBlock(block: any): Promise<any> {
        return apiClient.get(`/block/${block}`);
    }

    getEvents(): Promise<any> {
        return apiClient.get("/events");
    }

    getToken(): Promise<any> {
        return apiClient.get("/token");
    }
}
  
export default new ApiService();
