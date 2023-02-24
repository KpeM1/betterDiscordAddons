/**
 * @name AnimateYourStatus
 * @author KpeM
 * @authorId 353187047693090818
 * @description Animated Your Discord Status.
 * @source https://github.com/KpeM1/betterDiscordAddons/blob/main/Plugins/AnimateYourStatus_v2/AnimateYourStatus.plugin.js
 * @version 0.2.1
 * @updateUrl https://github.com/KpeM1/betterDiscordAddons/blob/main/Plugins/AnimateYourStatus_v2/AnimateYourStatus.plugin.js
*/

module.exports = class AnimateYourStatus {

    getName() { return "AnimateYourStatus"; }

    setData(key, value) {
        BdApi.setData(this.getName(), key, value);
    }

    deleteData (key)
    {
        BdApi.deleteData(this.getName(), key);
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
        if (index > (this.status.length-1)) {
            index = 0;
        }
        if (ind > (this.smile.length-1)) {
            
            ind = 0;
        }
        let _smile = this.smile[ind];
        let str = this.status[index];
        //console.log("size smile " + (this.smile.length));
        //console.log("size status " + (this.status.length));
        //console.log(index + " - " + str + " | "+ ind + " - " + _smile);
        Status.set(str, _smile);

        if (this.randomEnabled == true) {
            let i = this.getRandomArbitrary(0, this.status.length);
            i = Math.trunc(i);
            //console.log("i= " + i + " length= " + (this.status.length-1));
            this.loop = setTimeout(() => { this.changeStatus(i, i); }, this.timeout);
        }
        else {
            //console.log("i= " + i);
            index++;
            ind++;
            //console.log(index + " | " + ind);
            this.loop = setTimeout(() => { this.changeStatus(index, ind); }, this.timeout);
        }
    }

    strToAnimation(str) {
        let lines = str.split("\n");
        let out = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].length != 0) {
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
        
        console.log("settings open");
        
        let settings = document.createElement("div");

        // Auth token
        //settings.appendChild(GUI.newLabel("Auth Token (https://discordhelp.net/discord-token)"));
        let val = GUI.newLabel("Authorization Token (https://discordhelp.net/discord-token)");
        settings.appendChild(val);
        settings.appendChild(GUI.newDivider_());
        let _token = GUI.newInputPassw();
        _token.value = Status.authToken;
        settings.appendChild(_token);
        val.contentEditable = true;

        settings.appendChild(GUI.newDivider());
        
        // timeout
        settings.appendChild(GUI.newLabel("how often to change the status? (ms)"));
        settings.appendChild(GUI.newDivider_());
        let _timeout = GUI.newInput();
        _timeout.placeholder = "min 3000"
        _timeout.value = this.getData("timeout");
        settings.appendChild(_timeout);

        settings.appendChild(GUI.newDivider());
        // smile
        settings.appendChild(GUI.newLabel('Emoji'));
        settings.appendChild(GUI.newDivider_());
        let _smile = GUI.newSmile();
        _smile.placeholder = "emoji\nemoji\n..."
        _smile.style.fontFamily = "SourceCodePro,Consolas,Liberation Mono,Menlo,Courier,monospace";
        _smile.value = this.animationToStr(this.smile);
        settings.appendChild(_smile);
   
        settings.appendChild(GUI.newDivider());
        // Animation
        settings.appendChild(GUI.newLabel('Your Statuses'));
        settings.appendChild(GUI.newDivider_());
        let _status = GUI.newTextarea();
        _status.style.fontFamily = "SourceCodePro,Consolas,Liberation Mono,Menlo,Courier,monospace,Autour One, Crafty Girls";
        _status.placeholder = '"Message 1",\n"Message 2",\n...';
        _status.value = this.animationToStr(this.status);
        settings.appendChild(_status);

        //switch
        settings.appendChild(GUI.newDivider());
        settings.appendChild(GUI.newLabel('Enable or Disable random choice your status:'));
        settings.appendChild(GUI.newDivider_());

        let switchBut = GUI.newSwitch(this.randomEnabled);
        switchBut.onclick = () => {            
            if (this.randomEnabled == true) {
                this.randomEnabled = false;
            }
            else {
                
                this.randomEnabled = true;
            }
        };
        settings.appendChild(switchBut);

        // Save Button
        settings.appendChild(GUI.newDivider());
        let save = GUI.newButton("Save");
        save.onclick = () => {
            //Set Auth token
            this.setData("token", _token.value);
            //Set timeout
            this.setData("timeout", _timeout.value);
            //Set Smile
            this.setData("Smile", this.strToAnimation(_smile.value));
            //Set Animation
            this.setData("YourStatuses", this.strToAnimation(_status.value));
            //Set RandomEnabled
            this.setData("RandomEnabled", this.randomEnabled);

            this.stop();
            this.load();
            this.start();
        };
        settings.appendChild(save);


        //load
        /*settings.appendChild(GUI.newDivider());
        let load = GUI.newButton("Load");
        load.onclick = () => {

            this.stop();
            this.deleteData("rand");
            
            this.load();
            this.start();
        };
        settings.appendChild(load);*/
        // End
        return settings;
    }
    observer(changes) { } // Optional function. Observer for the `document`. Better documentation than I can provide is found here: <https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver>
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
    newDivider_: () => {
        let divider = document.createElement("div")
        divider.style.paddingTop = "5px";
        return divider;
    },
    newDivider: () => {
        let divider = document.createElement("div")
        divider.style.paddingTop = "15px";
        return divider;
    },
    newInput: () => {
        let input = document.createElement("input");
        input.className = "inputDefault-Ciwd-S input-3O04eu";
        return input;
    },
    newInputPassw: () => {
        let input = document.createElement("input");
        input.className = "inputDefault-Ciwd-S input-3O04eu";
        input.setAttribute("type", "password");
        return input;
    },
    newLabel: (text) => {
        let label = document.createElement("h5");
        label.className = "colorStandard-1Xxp1s size14-3fJ-ot h5-2RwDNl title-3hptVQ defaultMarginh5-3Jxf6f";
        label.innerText = text;
        return label;
    },
    newTextarea: () => {
        let textarea = document.createElement("textarea");
        textarea.className = "inputDefault-Ciwd-S input-3O04eu";
        textarea.style.resize = "vertical";
        textarea.rows = 4;
        return textarea;
    },

    newSmile: () => {
        let textSmile = document.createElement("textarea");
        textSmile.className = "inputDefault-Ciwd-S input-3O04eu";
        textSmile.style.resize = "vertical";
        textSmile.rows = 4;
        textSmile.cols = 1;
        return textSmile;
    },

    newButton: (text) => {
        let button = document.createElement("button");
        button.className = "button-ejjZWC lookFilled-1H2Jvj colorBrand-2M3O3N sizeMedium-2oH5mg grow-2T4nbg";
        //button.className = "marginBottom8-emkd0_ button-1cRKG6 button-f2h6uQ lookFilled-yCfaCM colorBrand-I6CyqQ sizeLarge-3mScP9 fullWidth-fJIsjq grow-2sR_-F";
        button.innerText = text;
        return button;
    },

    newSwitch: (value) => {

        let switchB = document.createElement("div");
        switchB.className = "bd-switch";

        let inp = document.createElement("input");
        inp.type = "checkbox";
        if (value) inp.setAttribute("checked", true);

        let div = document.createElement("div");
        div.className = "bd-switch-body";

        let svg = document.createElement("svg");
        svg.className = "bd-switch-slider";
        svg.setAttribute("viewBox", "0 0 28 20");
        svg.setAttribute("preserveAspectRatio", "xMinYMid meet");

        let rect = document.createElement("rect");
        rect.className = "bd-switch-handle";
        rect.setAttribute("fill", "white");
        rect.setAttribute("x", "4");
        rect.setAttribute("y", "0");
        rect.setAttribute("height", "20");
        rect.setAttribute("width", "20");
        rect.setAttribute("rx", "10");
        
        let svg2 = document.createElement("svg");
        svg2.className = "bd-switch-symbol";
        svg2.setAttribute("viewBox", "0 0 20 20");
        svg2.setAttribute("fill", "none");
        
        let path = document.createElement("path");
        let path2 = document.createElement("path");
        
        svg2.appendChild(path);
        svg2.appendChild(path2);

        
        svg.appendChild(rect);
        svg.appendChild(svg2);


        div.appendChild(svg);
        switchB.appendChild(inp);
        switchB.appendChild(div);

        return switchB;

    }
};