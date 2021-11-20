/**
 * @name AnimateYourStatus
 * @author KpeM
 * @authorId 353187047693090818
 * @description Animated Your Discord Status.
 * @source https://github.com/KpeM1/betterDiscordAddons/blob/main/Plugins/AnimateYourStatus/AnimateYourStatus.plugin.js
 * @version 0.1.0
*/
class AnimateYourStatus {
    getName() {
        return "AnimateYourStatus";
    }
    setData(key, value) {
        BdApi.setData(this.getName(), key, value);
    }

    getData(key) {
        return BdApi.getData(this.getName(), key);
    }

    load() {
        this.timeout = this.getData("timeout");
        if (this.timeout < 3000) {
            this.timeout = 3000;
            this.setData("timeout", 3000);
        }

        this.status = this.getData("YourStatuses");
        this.smile = this.getData("Smile");
        Status.authToken = this.getData("token");
    }

    start() {
        if (this.status == undefined || this.timeout == undefined || Status.authToken == undefined) return;
        this.changeStatus();
    }

    stop() {
        clearTimeout(this.loop);
        Status.unset();
    }

    getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    changeStatus(index = 0, ind = 0) {
        
        if (index > this.status.length-1) {
            index = 0;
        }
        if (ind > this.smile.length - 1) {
            ind = 0;
            
        }
        let smile="";
        let str = this.status[index].toString();
        if (index < this.smile.length) {
            smile = this.smile[index].toString();
        }
        else {
            smile = "";      
        }
        Status.set(str, smile);
        let i = this.getRandomArbitrary(0, this.status.length);
        i = Math.trunc(i);
        this.loop = setTimeout(() => { this.changeStatus(i, i); }, this.timeout);
    }
    strToAnimation(str) {
        let lines = str.split("\n");
        let out = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].length == 0) continue;

            out.push(JSON.parse("[" + lines[i] + "]"));
        }
        return out;
    }

    animationToStr(status) {
        if (status == undefined) return ""

        let out = "";
        for (let i = 0; i < status.length; i++) {
            out += JSON.stringify(status[i]).substr(1).slice(0, -1) + "\n";
        }
        return out;
    }

    getSettingsPanel() {
        let settings = document.createElement("div");
        settings.style.padding = "10px";

        // Auth token
        //settings.appendChild(GUI.newLabel("Auth Token (https://discordhelp.net/discord-token)"));
        let val = GUI.newLabel("Authorization Token (https://discordhelp.net/discord-token)");
        settings.appendChild(val);
        let token = GUI.newInputPassw();
        token.value = this.getData("token");
        settings.appendChild(token);
        val.contentEditable = true;



        settings.appendChild(GUI.newDivider());

        // timeout
        settings.appendChild(GUI.newLabel("how often to change the status? (ms)"));
        let timeout = GUI.newInput();
        timeout.placeholder = "min 3000"
        timeout.value = this.getData("timeout");
        settings.appendChild(timeout);

        settings.appendChild(GUI.newDivider());
        // smile
        settings.appendChild(GUI.newLabel('Emoji'));
        let smile = GUI.newSmile();
        smile.placeholder = "emoji\nemoji\n..."
        smile.style.fontFamily = "SourceCodePro,Consolas,Liberation Mono,Menlo,Courier,monospace";
        smile.value = this.animationToStr(this.getData("Smile"));
        settings.appendChild(smile);

        settings.appendChild(GUI.newDivider());
        // Animation
        settings.appendChild(GUI.newLabel('Your Statuses'));
        let status = GUI.newTextarea();
        status.style.fontFamily = "SourceCodePro,Consolas,Liberation Mono,Menlo,Courier,monospace,Autour One, Crafty Girls";
        status.placeholder = '"Message 1",\n"Message 2",\n...';
        status.value = this.animationToStr(this.getData("YourStatuses"));
        settings.appendChild(status);

        // Save Button
        settings.appendChild(GUI.newDivider());
        let save = GUI.newButton("Save");
        save.onclick = () => {
            // Set Auth token
            this.setData("token", token.value);

            // Set timeout
            this.setData("timeout", timeout.value);
            //
            this.setData("Smile", this.strToAnimation(smile.value));
            // Set Animation
            this.setData("YourStatuses", this.strToAnimation(status.value));

            this.stop();
            this.load();
            this.start();
        };
        settings.appendChild(save);

        // End
        return settings;
    }
}

/* Status API */
const Status = {
    authToken: "",
    request: () => {
        let req = new XMLHttpRequest();
        req.open("PATCH", "/api/v6/users/@me/settings", true);
        req.setRequestHeader("authorization", Status.authToken);
        req.setRequestHeader("content-type", "application/json");
        return req;
    },

    set: (status, smile) => {
        Status.request().send('{"custom_status":{"text":"' + status + '", "emoji_name": "' + smile + '"}}');
        // Status.request().send('{"custom_status":{"text":"' + status + '"}}');
    },

    unset: () => {
        Status.request().send('{"custom_status":null}');
    }
};

const GUI = {
    newInput: () => {
        let input = document.createElement("input");
        input.className = "inputDefault-_djjkz input-cIJ7To";
        return input;
    },
    newInputPassw: () => {
        let input = document.createElement("input");
        input.className = "inputDefault-_djjkz input-cIJ7To";
        input.setAttribute("type", "password");
        return input;
    },
    newLabel: (text) => {
        let label = document.createElement("h5");
        label.className = "h5-18_1nd";
        label.innerText = text;
        return label;
    },

    newDivider: () => {
        let divider = document.createElement("div");
        divider.style.paddingTop = "15px";
        return divider;
    },

    newTextarea: () => {
        let textarea = document.createElement("textarea");
        textarea.className = "input-cIJ7To scrollbarGhostHairline-1mSOM1";
        textarea.style.resize = "vertical";
        textarea.rows = 3;
        return textarea;
    },

    newSmile: () => {
        let textSmile = document.createElement("textarea");
        textSmile.className = "input-cIJ7To scrollbarGhostHairline-1mSOM1";
        textSmile.style.resize = "vertical";
        textSmile.rows = 3;
        textSmile.cols = 1;
        return textSmile;
    },

    newButton: (text) => {
        let button = document.createElement("button");
        button.className = "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn";
        button.innerText = text;
        return button;
    }
};