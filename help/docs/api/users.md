---
sidebar_position: 9
---

# `/users`

## GET

**Summary:** List users


### Responses

### Response 200

OK

### Response fields
_Array of items_


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `id` | integer | no | no |  |
| `email` | string | no | no | Email address associated with user |
| `description` | text | no | no | Description for the user |
| `password_digest` | string | no | no | User password for authentication |
| `admin` | boolean | no | no | Specifies if the user has access to administrative functions in the app |
| `reviewer` | boolean | no | no | Specifies if the user has access to the reviewer workflows in the app |


### Response 500

Server error

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `message` | string | yes | no |  |

