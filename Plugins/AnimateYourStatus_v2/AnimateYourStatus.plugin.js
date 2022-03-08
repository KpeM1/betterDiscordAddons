/**
 * @name AnimateYourStatus
 * @author KpeM
 * @authorId 353187047693090818
 * @description Animated Your Discord Status.
 * @source https://github.com/KpeM1/betterDiscordAddons/blob/main/Plugins/AnimateYourStatus/AnimateYourStatus.plugin.js
 * @version 0.2.0
*/

module.exports = class AnimateYourStatus {

    getName() { return "AnimateYourStatus";}

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
        this.randomEnabled = this.getData("RandomEnabled");

        this.status = this.getData("YourStatuses");
        this.smile = this.getData("Smile");

        Status.authToken = this.getData("token");
        } // Optional function. Called when the plugin is loaded in to memory

    start() {
        if (this.status == undefined || this.timeout == undefined || Status.authToken == undefined) return;
        this.changeStatus();
        } // Required function. Called when the plugin is activated (including after reloads)
    stop() {
        clearTimeout(this.loop);
        Status.unset();
        } // Required function. Called when the plugin is deactivated
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
        let str = this.status[index];
        if (index < this.smile.length) {
            smile = this.smile[index];
        }
        else {
            smile = "";      
        }
        Status.set(str, smile);
        if (this.randomEnabled==true)
        {
        let i = this.getRandomArbitrary(0, this.status.length);
        i = Math.trunc(i);
        //console.log("i= " + i + " length= " + (this.status.length-1));
        
        this.loop = setTimeout(() => { this.changeStatus(i, i); }, this.timeout);
        }
        else
        {
            let i=index;
            //console.log("i= " + i);
            i++;
            this.loop = setTimeout(() => { this.changeStatus(i, i); }, this.timeout);
        }
    }

    strToAnimation(str) {
        let lines = str.split("\n");
        let out = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].length!=0)
            {
                out.push(lines[i]);
            }
            //out.push(JSON.parse("[" + lines[i] + "]"));
        }
        return out;
    }

    animationToStr(status) {
        if (status == undefined) return "";

        let out = "";
        for (let i = 0; i < status.length; i++) {
            out += JSON.stringify(status[i]).substr(1).slice(0, -1) + "\n";
        }
        return out;
    }

    getSettingsPanel() {
        let settings = document.createElement("div");
        
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

        //switch
        settings.appendChild(GUI.newDivider());
        settings.appendChild(GUI.newLabel('Enable or Disable random chose your status:'));
        
        let switchBut = GUI.newSwitch(this.randomEnabled);
        switchBut.onclick = () => {
            if (this.rand==true) { this.rand = false;} else { this.rand=true; }
        };
        settings.appendChild(switchBut);

        // Save Button
        settings.appendChild(GUI.newDivider());
        let save = GUI.newButton("Save");
        save.onclick = () => {
            //Set Auth token
            this.setData("token", token.value);
            //Set timeout
            this.setData("timeout", timeout.value);
            //Set Smile
            this.setData("Smile", this.strToAnimation(smile.value));
            //Set Animation
            this.setData("YourStatuses", this.strToAnimation(status.value));
            //Set RandomEnabled
            this.setData("RandomEnabled", this.rand);

            this.stop();
            this.load();
            this.start();
        };
        settings.appendChild(save);

        // End
        return settings;
    }
    observer(changes) {} // Optional function. Observer for the `document`. Better documentation than I can provide is found here: <https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver>
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
    newDivider: () => {
        let divider = document.createElement("div")
        divider.style.paddingTop = "10px";
        return divider;
    },
    newInput: () => {
        let input = document.createElement("input");
        input.className = "inputDefault-3FGxgL input-2g-os5";
        return input;
    },
    newInputPassw: () => {
        let input = document.createElement("input");
        input.className = "inputDefault-3FGxgL input-2g-os5";
        input.setAttribute("type", "password");
        return input;
    },
    newLabel: (text) => {
        let label = document.createElement("h5");
        label.className = "colorStandard-21JIj7 size14-3fJ-ot h5-2RwDNl title-3hptVQ defaultMarginh5-3Jxf6f";
        label.innerText = text;
        return label;
    },
    newTextarea: () => {
        let textarea = document.createElement("textarea");
        textarea.className = "input-2g-os5";
        textarea.style.resize = "vertical";
        textarea.rows = 4;
        return textarea;
    },

    newSmile: () => {
        let textSmile = document.createElement("textarea");
        textSmile.className = "input-2g-os5";
        textSmile.style.resize = "vertical";
        textSmile.rows = 4;
        textSmile.cols = 1;
        return textSmile;
    },

    newButton: (text) => {
        let button = document.createElement("button");
        button.className = "bd-button button-f2h6uQ lookFilled-yCfaCM colorBrand-I6CyqQ sizeMedium-2bFIHr grow-2sR_-F";
        //button.className = "marginBottom8-emkd0_ button-1cRKG6 button-f2h6uQ lookFilled-yCfaCM colorBrand-I6CyqQ sizeLarge-3mScP9 fullWidth-fJIsjq grow-2sR_-F";
        button.innerText = text;
        return button;
    },

    newSwitch: (value)=>{
        let switchB = document.createElement("div");
        switchB.className = "bd-switch";

        let inp = document.createElement("input");
        inp.type = "checkbox";
        if (value) inp.setAttribute("checked", true);
        
        let div = document.createElement("div");
        div.className = "bd-switch-body";
        
        let svg = document.createElement("svg");
        svg.className = "bd-switch-slider";

        div.appendChild(svg);
        switchB.appendChild(inp);
        switchB.appendChild(div);
        
        return switchB;

    }
};