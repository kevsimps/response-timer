import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'


@customElement('response-timer')
export class ResponseTimer extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }
        `
    ];
    @property({ type: Object }) contactInfo? = {}
    @property({ type: Object }) timers: Map<string, any> = new Map()
    @property() webhook?: string = "https://hooks.us.webexconnect.io/events/617UH3Y0DS"
    @property({ type: Number }) timer = 10
    @property() token?: string    //$STORE.auth.accessToken
    ibMessage = new BroadcastChannel('onMessageReceived')
    obMessage = new BroadcastChannel('onMessageSent')
    connectedCallback() {
        super.connectedCallback();
        this.ibMessage.onmessage = (event) => this.updateTimeout("inbound", event.data)
        this.obMessage.onmessage = (event) => this.updateTimeout("outbound", event.data)
    }

    updateTimeout(direction: string, data: any) {
        const UserID = this.contactInfo?.getTaskIdFromConvId(data.conversationId).interaction.callAssociatedData.UserId.value
        const threadid = this.contactInfo?.getTaskIdFromConvId(data.conversationId).interaction.callAssociatedData.Threadid.value
        const convID: string = data.conversationId
        const interactionId: string = this.contactInfo?.getTaskIdFromConvId(data.conversationId).interactionId
        switch (direction) {
            case "outbound":
                console.log(direction, data, data.conversationId)
                this.timers.set(convID, setTimeout(() => {
                    //send message that the chat will be closed if they do not respond within a minute
                    this.sendWarning(threadid, UserID, convID)
                    console.log("Chat will close in 1 minute if you do not respond")
                    this.timers.set(convID, setTimeout(() => {
                        console.log("I told you...")
                        //End Chat
                        this.endChat(interactionId)
                        //Disposition the chat??
                        //Clean up timer
                        this.timers.delete(convID)
                    }, 60000))
                }, (this.timer - 1) * 60000))

                break;
            case "inbound":
                console.log(direction, UserID, threadid)
                clearTimeout(this.timers.get(convID))
                this.timers.delete(convID)
                break;

            default:
                break;
        }
    }

    async sendWarning(threadid: string, UserID: string, convID: string) {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "Threadid": `${threadid}`,
            "UserId": `${UserID}`,
            "conversationID": `${convID}`
        });

        const requestOptions: object = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        try {
            const response = await fetch(`${this.webhook}`, requestOptions);
            const result = await response.text();
            console.log(result)
        } catch (error) {
            console.error(error);
        };
    }

    async endChat(interactionId: string) {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${this.token}`);

        const requestOptions:object = {
            method: "POST",
            headers: myHeaders,
            redirect: "follow"
        };

        try {
            const response = await fetch(`https://api.wxcc-us1.cisco.com/v1/tasks/${interactionId}/end`, requestOptions);
            const result = await response.text();
            console.log(result)
        } catch (error) {
            console.error(error);
        };
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.ibMessage.close()
        this.obMessage.close()
    }
    render() {
        return html`

        `;
    }
}
