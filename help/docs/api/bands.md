---
sidebar_position: 4
---

# `/bands`

## GET

**Summary:** List bands (sorted by average_rating desc)


### Responses

### Response 200

OK

### Response fields
_Array of items_


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `band_id` | integer | yes | no |  |
| `name` | string | yes | no |  |
| `description` | string | no | yes |  |
| `average_rating` | number | no | yes |  |
| `location` | string | no | yes |  |
| `url` | string | no | yes |  |
| `genre_id` | integer | no | yes |  |
| `genre_name` | string | no | yes |  |
| `image` | string | no | yes |  |


### Response 500

Server error

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `message` | string | yes | no |  |


## POST

**Summary:** Create a new band


### Request body fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `name` | string | yes | no |  |
| `description` | string | no | yes |  |
| `average_rating` | number | no | yes |  |
| `location` | string | no | yes |  |
| `genre_id` | integer | yes | no |  |


### Responses

### Response 201

Created

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `id` | integer | no | no |  |
| `name` | string | no | no |  |
| `description` | string | no | yes |  |
| `average_rating` | number | no | yes |  |
| `location` | string | no | yes |  |
| `url` | string | no | yes |  |
| `genre_id` | integer | no | yes |  |


### Response 500

Server error

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `message` | string | yes | no |  |

