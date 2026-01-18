---
sidebar_position: 4
---
<!-- This file is auto-generated. Edits here will be overwritten. -->

# `/bands`

## GET

**Summary:** Get all bands.


Used to retrieve all bands in the database.


### Responses

#### Response 200

OK

#### Response fields
_Returns an array_


| Field (*) | Type | Description | Example |
|------|------|---------------|-----------------|
| `band_id`  | integer | Unique ID for the band. |  |
| `name`  | string | Name of the band. | `"Faux Real"` |
| `description`  | text | Summary of the band that can't be captured through genre alone. | `"French Art Pop duo producing jams with an eye for performance. We are all living in the  United Snakes of America, and the brothers Arndt are the snake charmers.\n"` |
| `average_rating`  | integer | Average rating for the band. | `4.2` |
| `location`  | string | Location the band calls home. | `"Los Angeles, CA"` |
| `url`  | string | URL for the band's website or social media site. | `"https://isthisfauxreal.com/"` |
| `genre_id`  | integer | Unique ID for a genre. | `2` |
| `genre_name`  | string | Name for a band's primary genre. | `"Art Pop"` |
| `image`  | string | (Do not use) Path to the web-hosted image. This image should be pre-processed to the correct size  and hosted in a secure location. | `"Currently not implemented"` |

(*) Required field

#### Response 500

Server error

#### Response fields


| Field (*) | Type | Description | Example |
|------|------|---------------|-----------------|
| `message` * | string |  |  |

(*) Required field

## POST

**Summary:** Create a new band


Creates a new band in the hippohonk database.

Required params: `name`, `genre_id`



# Request body fields


| Field (*) | Type | Description | Example |
|------|------|---------------|-----------------|
| `name` * | string | Name of the band. |  |
| `description`  | text | Summary of the band that can't be captured through genre alone. | `"French Art Pop duo producing jams with an eye for performance. We are all living in the  United Snakes of America, and the brothers Arndt are the snake charmers.\n"` |
| `average_rating`  | integer | Average rating for the band. | `4.2` |
| `location`  | string | Location the band calls home. | `"Los Angeles, CA"` |
| `genre_id` * | integer | Unique ID for a genre. | `2` |

(*) Required field

### Responses

#### Response 201

Band creation successful.

#### Response fields


| Field (*) | Type | Description | Example |
|------|------|---------------|-----------------|
| `id`  | integer | Unique ID for the band. |  |
| `name`  | string | Name of the band. | `"Faux Real"` |
| `description`  | text | Summary of the band that can't be captured through genre alone. | `"French Art Pop duo producing jams with an eye for performance. We are all living in the  United Snakes of America, and the brothers Arndt are the snake charmers.\n"` |
| `average_rating`  | integer | Average rating for the band. | `4.2` |
| `location`  | string | Location the band calls home. | `"Los Angeles, CA"` |
| `genre_id`  | integer | Unique ID for a genre. | `2` |
| `url`  | string | URL for the band's website or social media site. | `"https://isthisfauxreal.com/"` |

(*) Required field

#### Response 500

Server error

#### Response fields


| Field (*) | Type | Description | Example |
|------|------|---------------|-----------------|
| `message` * | string |  |  |

(*) Required field
