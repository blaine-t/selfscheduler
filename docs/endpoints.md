# Endpoints

## [https://unl.collegescheduler.com]

### GET

- INDEX.ASPX?TICKET=`${yourTicket}`
  - Generates the `.AspNet.Cookies` used for authenticating with API.
  - Uses two headers in a previous get request to generate `yourTicket`

- entry
  - Nothing noteworthy just the option to choose term for classes

- api/app-data
  - Lots of interesting information in here.
    - Current classes
    - Breaks
    - Terms
    - Lots of configuration settings
    - Prompt strings
    - Lots of different titles and then these:

```json
{
  "detailAlign": "left",
  "hideNoteBelowLabel": false,
  "highlight": false,
  "noteBelow": false,
  "persistColumn": true,
  "showColumn": true,
  "hideDetail": true,
  "key": "${KEY}"
}
```

- api/term-data/`${termString}`
  - Lists the data you have for that term
    - courses
    - academicCareers
    - campuses/locations
    - instructionModes
    - partsOfTerm
  
- api/terms/`${termString}`/subjects/`${subjectShort}`/courses/`${number}`/regblocks
  - You can strip back this URL a bit to get a couple different results
  - This one lists all of the blocks available for a class

```json
{
  "registrationBlocks": [
    {
      "id": "CLAS;;180@3177",
      "sectionIds": [
        "3177"
      ],
      "optionalSectionIds": [],
      "selected": true,
      "showLock": false,
      "enabled": true,
      "disabledReasons": ["This section is full."],
      "desiredCourseId": null,
      "lcId": null
    },
  ]
}
```

- /api/help/videos
  - Responds with JSON of help videos on how to use the program

- /api/help/links
  - Responds with nothing for our instance

- api/oauth/student/client-credentials/token
  - Does get request and uses `.AspNet.Cookies` to generate an accessToken
  - accessToken returned in JSON and then used in socket.io

```json
{"accessToken":"myToken"}
```

- api/terms/`${termString}`/shoppingcart
  - Decently sized JSON of what is currently in the shopping cart
  - Useful for keeping track of what's in shopping cart as collegescheduler implementation of cart doesn't keep track

- api/terms/`${termString}`/currentschedule
  - Decently sized JSON of what current schedule is
  - Useful for displaying our own custom schedule and checking credit hours

### PUT

- api/terms/`${termString}`/locations/update
  - Puts json of what campuses/locations are selected in this format:

```json
[
  {
    "id": "City Campus",
    "title": "City Campus",
    "selected": true,
    "code": "CITY",
    "locked": false,
    "settings": {}
  }
]
```

- api/terms/`${termString}`/partsofterm/update
  - Puts json of what sessions are selected in this format:

```json
[
  {
    "id": "Regular Academic Session",
    "title": "Regular Academic Session",
    "selected": true,
    "code": "1",
    "locked": false,
    "settings": {}
  }
]
```

- api/terms/`${termString}`/instructionmodes/update
  - Puts json of what instruction modes you would like to view

```json
[
  {
    "id": "In Person",
    "title": "In Person",
    "selected": true,
    "code": "P",
    "locked": false,
    "settings": {}
  }
]
```

- api/coursestatuses/`${OpenAndFull/OpenAndFullWithWaitlistOpen/OpenOnly}`/selected
  - Sets what to show in courses sections and generating schedule
  - Includes a JSON for no apparent reason:

```json
{
  "id": "OpenOnly",
  "title": "Open Classes Only",
  "selected": true,
  "code": "OpenOnly",
  "locked": false,
  "settings": {}
}
```

- api/breaks/`${breakId}`
  - This put updates an already existing break
  - Very similar to POST api/breaks

```json
{
  "id": 23211,
  "daysRaw": "WT",
  "endTime": "0300",
  "startTime": "0800",
  "termCodes": [
    "1238"
  ],
  "title": "New Break"
}
```

- api/user_settings
  - padding and other custom settings for the scheduler in JSON

```json
{
  "padding": 5,
  "customSettings": {}
}
```

### POST

- api/breaks
  - Submit a new break
  - Same JSON format minus the id in PUT api/breaks/`${breakId}`

- api/terms/`${termString}`/desiredcourses
  - Posts to get a response and adds that class to your desired courses
  - Many different JSON formats (Subject, Section Attribute, Class #)

- api/terms/`${termString}`/schedules/generate
  - Posts info required to generate a schedule
  - Returns massive json of all schedules

```json
{
  "breaks": [],
  "cartSections": [],
  "courses": [],
  "currentSections": [
    {
      "course": "314",
      "enrollmentStatus": "Enrolled",
      "id": "4239",
      "isExternal": false,
      "registrationNumber": "4239",
      "subject": "Math",
      "subjectId": "MATH",
      "topicId": null
    }
  ],
  "padding": 0
}
```

### DELETE

- api/breaks/`${breakId}`
  - Removes a break from your list of breaks
  - Sends an empty JSON

- api/terms/`${termString}`/desiredcourses/`${courseId}`
  - Removes a class from your list of desired courses
  - Sends an empty JSON

## [https://api.collegescheduler.com]

- GET 302 /socket.io/?EIO=3&transport=websocket
  - Very crucial endpoint on the server as it allows for:
    - Add To cart
    - Remove from cart
    - Register cart
    - Drop classes
    - Swap classes
  - Uses socket.io with Engine.io version 3 and only allows websockets
