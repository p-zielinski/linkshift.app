## Redirect Master API Specification (v1)
REST API documentation for the Redirect Master application. This specification defines endpoints, data structures, and validation logic required for implementing Angular services.
### 1.Global Configuration
  - Base Path: /api/v1
  - Authorization Strategy: Bearer JWT.
    - Include the Authorization: Bearer <token> header in all requests except /auth/login and /auth/register.
  - Response Wrapper: Every successful response follows this envelope:
  
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  warnings?: string[]; // Used during rule creation/edition (e.g., potential loops)
}
```

### 2. Authentication Module (/auth)

#### Register
`POST /auth/register`
Payload:
```
{
  email: string;            // Valid email format
  password: string;         // Min. 8 characters
  organizationName: string; // Min. 1 character
  plan?: 'FREE' | 'BASIC' | 'PRO';
}
```

Returns: `ApiResponse<{ user: User, accessToken: string }>`
Notes:
- Refresh token is set as an HttpOnly cookie (`refresh_token`) scoped to `/api/v1/auth/refresh`.

#### Login
`POST /auth/login`
Payload:
```json
{
    email: string;
    password: string;
}
```
Returns: `ApiResponse<{ user: User, accessToken: string }>`
Notes:
- Refresh token is set as an HttpOnly cookie (`refresh_token`) scoped to `/api/v1/auth/refresh`.

#### Token Refresh
`POST /auth/refresh`
Payload: `{ refreshToken?: string }` (optional if the cookie is present)
Returns: `ApiResponse<{ accessToken: string }>`
Notes:
- Refresh token is rotated and sent back via HttpOnly cookie.

#### Logout
`POST /auth/logout`
Clears the refresh token cookie.

### 3. Domain Groups Module (/domain-groups)

Used to categorize domains.

| Method | Endpoint           | Description                                    |
|--------|--------------------|------------------------------------------------|
| GET    | /domain-groups     | Fetches a list of all groups.                  |
| GET    | /domain-groups/:id | Fetches details of a specific group.           |
| POST   | /domain-groups     | Creates a new group. Payload: { name: string } |
| PUT    | /domain-groups/:id | Updates a group. Payload: { name: string }     |
| DELETE | /domain-groups/:id | Deletes a group.                               |

### 4. Domains Module (/domains)
Specific domains assigned to groups.
#### List Domains
`GET /domains`
Returns: `ApiResponse<Domain[]>`

#### Add Domain
`POST /domains`
Payload:
```
{
  name: string;          // FQDN format (e.g., example.com)
  domainGroupId: string; // CUID with prefix
}
```

#### Edit/Delete
- `PUT /domains/:id` - Payload: `{ name?: string, domainGroupId?: string }`
- `DELETE /domains/:id`

### 5. Redirect Rules Module (/redirect-rules)
The core of the redirection logic.

#### Create Rule
`POST /redirect-rules`
Payload:
```
{
  source: string;        // Literal path or Regex (e.g., "/old" or "/^\/old-(.*)/")
  destination: string;   // URL or Template (supports variables and logic)
  statusCode: number;    // 301, 302, 303, 307, 308 (Default: 302)
  priority: number;      // 0-1000 (Default: 0)
  domainGroupId: string; // Required
}
```

#### Edit/Delete
- `PUT /redirect-rules/:id` - Payload: Partial Create Rule object.
- `DELETE /redirect-rules/:id`

### 6. Error Schema
In case of errors (4xx or 5xx), the following object is returned:
```typescript
interface ApiError {
  statusCode: number;
  error: string;          // Error code/slug
  message: string;        // User-friendly message
  requestId: string;      // ID for log correlation
  details?: string;       // Technical details
  relatedObject?: string; // e.g., "Domain"
  relatedObjectId?: string;
}
```
