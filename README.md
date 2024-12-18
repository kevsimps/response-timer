# response-timer

This headless desktop widget for the Webex Contact Center works in conjunction with Webex Connect's inbound chat flow and a custom webhook to monitor chats for inactivity.  The number of minutes to wait for a customer to respond to the agent can be configured in the desktop layout or it will default to 10 minutes after the last message has been sent by the agent. One minute prior to automatically ending the chat for customer inactivity, a predefined message will be sent to the customer to inform them that teh chat will end if they do not respond.



## Implementation steps

### Add a Set Variable node to your inbound chat flow before the Queue Contact node
> Method Name: Set Flow Variable
>
> Task ID: `$(taskId)`
>
> Variable 1:
>> Name: `Threadid`
>>
>> Type: String
>>
>> Value: `$(n2.inappmessaging.threadId`
>>
>> Make agent viewable : True
>> 
>> Desktop Label: any (not empty)
>
> Variable 2:
>> Name: `UserId`
>>
>> Type: String
>>
>> Value: `$(n2.inappmessaging.userId)`
>>
>> Make agent viewable : True
>> 
>> Desktop Label: any (not empty)
>
> Save and Publish
> 
> ---

### Create a New Flow
> Type: Webhook
>
> Create new event: True
>
> Provide Sample Input: 
```JSON
    {
    "Threadid": "",
    "UserId": "",
    "conversationID": ""
    }
```
> Click Parse
>
> Click Save
>
>---

#### Add a Live Chat or In-App Messaging node
>
> ![alt text](image.png)
>
#### Add an Append Conversation node
>
> ![alt text](image-1.png)
>
> Note: Make sure that the Text field is properly addressing the Live Chat or In-App Messaging Node ID
>
> Publish the flow
>
> ---


### Add this entry for the headless widget into the desktop layout:

```JSON
"headless": {
        "id": "headless",
        "widgets": {
          "comp1": {
            "comp": "response-timer",
            "properties": {
              "token": "$STORE.auth.accessToken",
              "contactInfo":"$STORE.agentContact",
			  "webhook":"<URL FOR WEBHOOK>",
			  "timer": 10 # Optional time in minutes before ending the chat. (Must be at least 2 Default is 10)
            },
            "script": "https://cdn.jsdelivr.net/gh/kevsimps/response-timer@fc76ee0/dist/index.js"
          }
        },
        "layout": {
          "areas": [
            [
              "comp1"
            ]
          ],
          "size": {
            "cols": [
              1
            ],
            "rows": [
              1
            ]
          }
        }
      },
```
