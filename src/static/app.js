app = {
    location:{
        getNew:()=>{
            app.time.round++;
            var country = localStorage.getItem("cRange");
            country=country=="world"?"location":country;
            fetch(`./get/${country}.php`).then(res => res.json())
            .then(data => {
                app.location.current = data;
                app.location.setCurrent()
                if(!data.date){
                    document.querySelector(".info").style.display = "none"
                }else{
                    document.querySelector(".info").style.display = ""
                }
            });
        },
        current:{},
        setCurrent:()=>{
            document.querySelector("iframe.streetview").src = buildStreetViewUrl(app.location.current.lat,app.location.current.lon,app.location.current.pano_id)
            setTimeout(()=>{
                document.querySelector("iframe.streetview").style.opacity = "1"
            },500)
            document.querySelector(`input[value="${localStorage.getItem("cRange")}"]`).checked = "checked";
            app.level.render()
            if(localStorage.getItem("cRange")=="world"){
                document.querySelector(".hint").style.display = ""
            }else{
                document.querySelector(".hint").style.display = "none"
            }
        }
    },
    buttons:{
        restart:()=>{
            document.querySelector("iframe.streetview").style.opacity = "0"
            app.location.setCurrent()
        },
        showHint:(target)=>{
            if(!target) return
            document.querySelector(".msg .title").textContent = "Hint"
            document.querySelector(".msg .content").textContent = `The location is in or near ${getContinent(app.location.current.lat,app.location.current.lon)}.`
            document.querySelector(".msg-outer").style.display = "";
            setTimeout(()=>{
                document.querySelector(".msg-outer").classList.remove("hidden")
            },10)
            app.score.usedHint=true;
            target.classList.add("active")
        },
        hideHint:()=>{
            document.querySelector(".msg-outer").classList.add("hidden")
            setTimeout(()=>{
                document.querySelector(".msg-outer").style.display = "none";
                app.cookies.check()
            },150)
        },
        info:()=>{
            document.querySelector(".msg .title").textContent = ""
            document.querySelector(".msg .content").textContent = `StreetView Pano published on ${app.location.current.date} by Google StreetView Services.`
            document.querySelector(".msg-outer").style.display = "";
            setTimeout(()=>{
                document.querySelector(".msg-outer").classList.remove("hidden")
            },10)
        },
        new:()=>{
            app.score.usedHint=false;
            if(app.time.round==6){
                app.round.end()
                return
            }
            document.querySelector(".solution").classList.add("hidden");
            document.querySelector(".hint").classList.remove("active")
            app.time.paused=false;
            setTimeout(()=>{
                document.querySelector(".solution").style.display = "none"
            },150)
            setTimeout(app.round.show,500)
        }
    },
    score:{
        usedHint:false,
        calculate:()=>{
            if(detectMob()==true){
                app.fullscreen()
            }
            app.time.paused=true;
            document.querySelector(".solution").style.display = ""
            setTimeout(()=>{document.querySelector(".solution").classList.remove("hidden")});
            const distance = setTwoPinsSolution([app.location.current.lat,app.location.current.lon],app.map.selected);
            document.querySelector(".solution-stats .meters").innerHTML = distance>5000 ? `<span>${Math.round(distance/1000)}</span> km` : `<span>${distance}</span> m`;
            xp = app.score.usedHint==true?mToXP(distance)/2:mToXP(distance);
            if(localStorage.getItem("cRange")!="world"){
                xp=0;
            }
            document.querySelector(".solution-stats .xp span").textContent = xp;
            document.querySelector(".solution-stats .text").textContent = app.score.usedHint==true?"Half the points since you needed a hint":xpToText(xp);
            document.querySelector(".solution-stats .progress div").style.width = xp/20 + "%";
            if(localStorage.getItem("cRange")!="world"){
                document.querySelector(".solution-stats .text").textContent="You can't gain XP on this map yet"
            }
            setTimeout(()=>{
                app.score.xp+=xp;
                app.location.getNew()
                removeMarker()
            },300)
            localStorage.setItem("qLS",parseInt(localStorage.getItem("qLS"))+xp)
        },
        xp:0
    },
    map:{
        selected:[]
    },
    cookies:{
        decline:()=>{
            localStorage.clear()
            document.querySelector(".cookies-outer").classList.add("hidden")
            setTimeout(()=>{
                document.querySelector(".cookies-outer").style.display = "none";
            },150)
            //idk wollte es halt übersichtlicher machen :)
            setTimeout(()=>{
                document.querySelector(".msg .title").textContent = "We accept your choice"
                document.querySelector(".msg .content").textContent = "Our website does not work correctly without cookies. If you insist on not wanting any cookies saved on your device, you can close this tab."
                document.querySelector(".msg-outer").style.display = "";
                setTimeout(()=>{
                    document.querySelector(".msg-outer").classList.remove("hidden")
                },70)
            },150)
            app.level.render()
        },
        check:()=>{
            app.cookies.permission=localStorage.getItem("pCookies")?true:false
            if(app.cookies.permission!=true){
                document.querySelector(".cookies-outer").style.display = "";
                setTimeout(()=>{
                    document.querySelector(".cookies-outer").classList.remove("hidden")
                },70)
            }else if(!localStorage.getItem("qLS")){
                localStorage.setItem("qLS","0")
            }
            if(app.cookies.permission==true&&!localStorage.getItem("cRange")){
                localStorage.setItem("cRange","world")
            }
            app.level.render()
        },
        accept:()=>{
            localStorage.setItem("pCookies","1")
            document.querySelector(".cookies-outer").classList.add("hidden")
            setTimeout(()=>{
                document.querySelector(".cookies-outer").style.display = "none";
                app.cookies.check()
            },150)
        },
        reset:()=>{
            localStorage.removeItem("pCookies");
            app.cookies.check()
        },
        permission:localStorage.getItem("pCookies")?true:false
    },
    error:{
        print:(err)=>{
            app.error.hide()
            setTimeout(()=>{
                document.querySelector(".error span").textContent = err;
                document.querySelector(".error").style.display = ""
                setTimeout(()=>{
                    document.querySelector(".error").classList.remove("hidden");
                },10)
                app.error.timeout = setTimeout(app.error.hide,4000)
            },150)
        },
        timeout:0,
        hide:()=>{
            clearTimeout(app.error.timeout)
            document.querySelector(".error").classList.add("hidden");
            setTimeout(()=>{
                document.querySelector(".error").style.display = "none"
            },150)
        }
    },
    time:{
        paused:true,
        s:-1,
        round:0
    },
    round:{
        show:()=>{
            document.querySelector(".round-count span.n").textContent = app.time.round;
            document.querySelector(".round-count").classList.remove("hidden");
            setTimeout(()=>{
                document.querySelector(".round-count").classList.add("hidden");
            },1500)
        },
        end:()=>{
            document.querySelector(".finished-round .title").textContent = `You gained ${app.score.xp} XP this round.`;
            document.querySelector(".finished-round .content").textContent = `You gained ${app.score.xp} XP in under ${Math.ceil(app.time.s/60)} minute${app.time.s<61?"":"s"}. ${getXPForLevel(1+Math.floor(getLevelForXP(localStorage.getItem("qLS"))))-localStorage.getItem("qLS")} XP until you reach level ${1+Math.floor(getLevelForXP(localStorage.getItem("qLS")))}`;
            document.querySelector(".finished-round").style.display = "";
            setTimeout(()=>{
                document.querySelector(".finished-round").classList.remove("hidden")
            },10)
        },
        new:()=>{
            app.time.paused = true;
            app.time.round = 0;
            app.score.xp = 0;
            app.time.s = -1;
            app.location.getNew();
            app.buttons.new()
            document.querySelector(".finished-round").classList.add("hidden")
            document.querySelector(".stats-left .value span").textContent = "0";
            document.querySelector("iframe.streetview").style.opacity = "0"
            setTimeout(()=>{
                document.querySelector(".finished-round").style.display = "none";
            },150)
        }
    },
    level:{
        render:()=>{
            if(window.innerWidth>580){
                document.querySelector(".levelBtn span").textContent = "Level " + Math.floor(getLevelForXP(localStorage.getItem("qLS")));
            }else{
                document.querySelector(".levelBtn span").textContent = Math.floor(getLevelForXP(localStorage.getItem("qLS")));
            }
            document.querySelector(".levelBtn div").style.width = 100*(getLevelForXP(localStorage.getItem("qLS"))-Math.floor(getLevelForXP(localStorage.getItem("qLS"))))+"%";
        }
    },
    fullscreen:()=>{
        var elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    },
    open:{
        github:()=>{
            window.open("https://github.com/einfachniemmand/worldguessr")
        }
    },
    settings:{
        open:()=>{
            document.querySelector(".settings").style.display = "";
            setTimeout(()=>{
                document.querySelector(".settings").classList.remove("hidden")
            },10)
        },
        close:()=>{
            document.querySelector(".settings").classList.add("hidden");
            setTimeout(()=>{
                document.querySelector(".settings").style.display = "none"
            },150)
        }
    },
    events:{
        setCountry:(c)=>{
            localStorage.setItem("cRange",c);
            app.round.new();
            setTimeout(()=>{
                document.querySelector(".changecountry span").textContent = `Started new round ${c=="world"?"":("in "+c.charAt(0).toUpperCase() + c.slice(1))}`
                app.events.alert.open()
            },250)
        },
        alert:{
            timeout:0,
            open:()=>{
                document.querySelector(".changecountry").classList.remove("hidden");
                app.events.alert.timeout = setTimeout(app.events.alert.hide,1000)
            },
            hide:()=>{
                clearTimeout(app.events.alert.timeout);
                document.querySelector(".changecountry").classList.add("hidden");
            }
        }
    },
}
function buildStreetViewUrl(lat, lon, pan) {
  return `https://www.google.com/maps/embed?pb=!4v!6m8!1m7!1s${pan}!2m2!1d${lat}!2d${lon}!3f!4f!5f`;
}
function getXPForLevel(level) {
    if (level <= 1) return 500;
    let xp = 500;
    for (let i = 2; i <= level; i++) {
        xp += Math.floor(xp / 2);
    }
    return xp;
}
function getLevelForXP(xp) {
    let level = 0;
    let requiredXP = getXPForLevel(level + 1);
    if (xp < requiredXP) {
        return xp / requiredXP;
    }
    while (xp >= requiredXP) {
        level++;
        requiredXP = getXPForLevel(level + 1);
    }
    const prevXP = getXPForLevel(level);
    if (requiredXP === prevXP) return level;
    const progress = (xp - prevXP) / (requiredXP - prevXP);
    return level + progress;
}
function mToXP (m) {
    const maxXP = 2000;
    const minDistance = 50;
    const maxDistance = 5500000;
    if (m >= maxDistance) return 0;
    if (m <= minDistance) return maxXP;
    const xp = maxXP * (1 - (m - minDistance) / (maxDistance - minDistance));
    return Math.max(0, Math.round(xp));
}
function xpToText (xp) {
    if (xp>1990) return "Cheater?"
    if (xp>1950) return "So close!"
    if (xp>1900) return "Really not bad!"
    if (xp>1700) return "Well done!"
    if (xp>1500) return "Good job there!"
    if (xp>1200) return "Nice try!"
    if (xp>700) return "Decent!"
    if (xp>400) return "You can do it!"
    if (xp>100) return "Not bad!"
    if (xp>50) return "You have potential!"
    if (xp>=0) return "Same planet!"
}
function getContinent(lat, lng) {
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        if (lat >= -90 && lat <= -60) return 'Antarctica';
        if (lat >= -35 && lat <= 37 && lng >= -20 && lng <= 55) return 'Africa';
        if (lat >= 5 && lat <= 55 && lng >= -170 && lng <= -50) return 'North America';
        if (lat >= -60 && lat <= 15 && lng >= -90 && lng <= -30) return 'South America';
        if (lat >= 35 && lat <= 70 && lng >= -25 && lng <= 60) return 'Europe';
        if (lat >= 5 && lat <= 80 && lng >= 60 && lng <= 180) return 'Asia';
        if (lat >= -50 && lat <= 0 && lng >= 110 && lng <= 180) return 'Oceania';
        return 'the earth'
    } else {
        return "the universe"
    }
}
var setXP=-1;
function loadAllTimeStats () {
    setInterval(()=>{
        if(app.score.xp>setXP){
            setXP++;
            document.querySelector(".stats-left .value span").textContent = setXP;
        }
    },6)
    setInterval(()=>{
        f=(t)=>{
            return t < 10 ? "0" + t : t;
        }
        if(app.time.paused == false){
            app.time.s++;
        }
        m = Math.floor(app.time.s/60);
        s = app.time.s - m*60;
        document.querySelector(".stats-right .value span").textContent = `${f(m)}:${f(s)}`
    },1000)
}
function detectMob() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];
    
    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
}
window.onload = function (){
    app.time.paused=false;
    app.cookies.check()
    app.location.getNew();
    loadAllTimeStats()
    setTimeout(app.round.show,1500)
}
if (window.history && window.history.replaceState) {
    const url = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, url);
}
if(window.innerWidth<581){
    document.querySelector(".round-count span").textContent = ""
}
window.addEventListener('error', function(event) {
    const eventID = Math.round(Math.random()*10000)
    app.error.print(event.message+" - "+eventID)
    console.error(`Script error ${eventID}:`, event.message, 'at', event.filename + ':' + event.lineno + ':' + event.colno);
});
window.addEventListener('unhandledrejection', function(event) {
    const eventID = Math.round(Math.random()*10000)
    app.error.print("Unhandled Promise Rejection - "+eventID)
    console.error(`Unhandled promise rejection ${eventID}:`, event.reason);
});
