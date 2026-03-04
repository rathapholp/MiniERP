import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, any>) {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http.get<T>(`${this.baseUrl}/${path}`, { params: httpParams });
  }

  post<T>(path: string, body: any) {
    return this.http.post<T>(`${this.baseUrl}/${path}`, body);
  }

  put<T>(path: string, body: any) {
    return this.http.put<T>(`${this.baseUrl}/${path}`, body);
  }

  patch<T>(path: string, body: any) {
    return this.http.patch<T>(`${this.baseUrl}/${path}`, body);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${this.baseUrl}/${path}`);
  }
}
