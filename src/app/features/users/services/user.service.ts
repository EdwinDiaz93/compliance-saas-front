import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserRequest, User, UsersFilters, UsersResponse, InvitationsRequest } from '@shared/interfaces';
import { environment } from 'environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {


  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);


  saveUser(userRequest: UserRequest) {
    return this.httpClient.post(`${this.baseUrl}/users`, userRequest);
  }

  getUsers(usersFilter: UsersFilters) {
    return this.httpClient.post<UsersResponse>(`${this.baseUrl}/users/search`, usersFilter);
  }

  getUser(id: string) {
    return this.httpClient.get<User>(`${this.baseUrl}/users/${id}`);
  }

  updateUser(id: string, userRequest: UserRequest) {
    return this.httpClient.patch(`${this.baseUrl}/users/${id}`, userRequest);
  }

  sendInvitations(userIds: string[]) {
    const invitationsRequest: InvitationsRequest = {
      userIds
    }
    return this.httpClient.post(`${this.baseUrl}/users/invitations`, invitationsRequest);
  }


}
