---
sidebar_position: 6
---

# `/genres`

## GET

**Summary:** List genres


### Responses

### Response 200

OK

### Response fields
_Array of items_


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `id` | integer | no | no |  |
| `name` | string | no | no |  |


### Response 500

Server error

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `message` | string | yes | no |  |


## POST

**Summary:** Create a new genre


### Request body fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `name` | string | yes | no |  |


### Responses

### Response 201

Created

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `id` | integer | no | no |  |
| `name` | string | no | no |  |


### Response 500

Server error

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `message` | string | yes | no |  |

