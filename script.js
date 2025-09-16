const allCards = document.querySelectorAll(".card");
let currentTrack = new Audio();
let mute = false
let hamburgerOut = false
let songs;
let currentFolder;


function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}


const playSong = (track) => {
    document.querySelector(".songName").firstElementChild.innerHTML = track
    currentTrack.src = `/songs/${currentFolder}%5C` + track
    currentTrack.load()
    currentTrack.addEventListener("loadedmetadata", e => {
        document.querySelector(".totalDuration").innerHTML = formatTime(currentTrack.duration)
    })
    const playToggle = document.querySelector(".playBtn")
    playToggle.src = "Assests/svg/pause.svg"
    currentTrack.play().catch(e => {
        console.error(e);
    })
}

async function displayAlbumbs() {
    const a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let cardContainer = document.querySelector(".cardContainer")
    let as = div.getElementsByTagName("a")
    let asArray = Array.from(as)

    await Promise.all(asArray.map(async a => {
        if (a.href.includes("songs%5C")) {
            let tempFolder = a.href.split("songs%5C").slice(-1)[0].split("/").slice(0)[0]
            const h = await fetch(`http://127.0.0.1:3000/songs/${tempFolder}/info.json`)
            const res = await h.json()
            return `<div class="card borderRounded p-1">
                            <div class="cardPlay"><img src="Assests/svg/cardPlay.svg" alt=""></div>
                            <img src="/songs/${tempFolder}/cover.jpg" alt="playlistPic">
                            <h2>${res.title}</h2>
                            <p>${res.discription}</p>
                        </div>`
        }
    })
    ).then(card => {
        // cardContainer.innerHTML = cardContainer.innerHTML + `${card}`
        cardContainer.innerHTML = card.filter(Boolean).join("");
    })
    let cards = cardContainer.getElementsByClassName("card")
    Array.from(cards).forEach(element => {
        let folName = element.getElementsByTagName("h2")[0].innerHTML
        element.addEventListener("click", () => {
            getSongs(folName)
        })
        const playBtn = element.querySelector(".cardPlay");

        element.addEventListener("mouseenter", () => {
            playBtn.classList.add("moveUP");
        });

        element.addEventListener("mouseleave", () => {
            playBtn.classList.remove("moveUP");
        });
        playBtn.addEventListener("click", e => {
            playLibrary()
        })
    })
}


async function getSongs(folder) {
    const a = await fetch(`http://127.0.0.1:3000/songs/${folder}`)
    currentFolder = encodeURIComponent(folder)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3"))
            songs.push(element.href)
    }
    const songList = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songList.innerHTML = ""
    for (let song of songs) {
        const temp = document.createElement("li")
        // temp.innerHTML = song.slice(28)/ 
        // %5CAlbumb%202%5C
        song = song.split(`${currentFolder}%5C`)[1].replaceAll("%20", " ")
        songList.innerHTML = songList.innerHTML + `<li class="flex align pointer librarySongs borderRounded">
                            <div class="flex g-1 align">
                                <img src="Assests/svg/songName.svg" alt="songIcon">
                                <div class="songname">${song}</div>
                            </div>
                            <div class="playNow flex align justify">Play Now
                                <img src="Assests/svg/playNow.svg" alt="">
                            </div>
                        </li>`
        // songList.innerHTML = "kwbfiuw"
        // songList.appendChild(temp)
    }

    Array.from(document.querySelector(".songUL").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playSong(e.querySelector(".songname").innerHTML)
        })
    })



    return songs
}

// Play Library
const playLibrary = () => {
    playSong(songs[0].split(`${currentFolder}%5C`)[1].replaceAll("%20", " "))

}

const autoNext = () => {
    console.log(done);
}

// Play and Pause
const playToggle = document.querySelector(".playBtn")
playToggle.addEventListener("click", e => {
    if (currentTrack.src) {
        if (currentTrack.paused) {
            currentTrack.play()
            playToggle.src = "Assests/svg/pause.svg"
        }
        else {
            currentTrack.pause()
            playToggle.src = "Assests/svg/play.svg"
        }
    }
})

// Next
const next = document.querySelector(".nextBtn")
next.addEventListener("click", e => {
    let index = songs.indexOf(`http://127.0.0.1:3000/%5Csongs%5C${currentFolder}%5C` + currentTrack.src.split(`${currentFolder}%5C`).slice(-1))
    if (index + 1 < songs.length) {
        currentTrack.pause()
        playSong(songs[index + 1].split(`${currentFolder}%5C`)[1].replaceAll("%20", " "))
    }
})


// Previous
const previous = document.querySelector(".previousBtn")
previous.addEventListener("click", e => {
    let index = songs.indexOf(`http://127.0.0.1:3000/%5Csongs%5C${currentFolder}%5C` + currentTrack.src.split(`${currentFolder}%5C`).slice(-1))
    if (index - 1 >= 0) {
        currentTrack.pause()
        playSong(songs[index - 1].split(`${currentFolder}%5C`)[1].replaceAll("%20", " "))
    }
})


// To update time and auto next
currentTrack.addEventListener("timeupdate", e => {
    document.querySelector(".currentDuration").innerHTML = formatTime(currentTrack.currentTime)
    let seekpositon = (currentTrack.currentTime / currentTrack.duration) * 100
    if (seekpositon > 99) {
        document.querySelector(".seek-song").style.left = `99.5%`
    }
    else (
        document.querySelector(".seek-song").style.left = `${seekpositon}%`
    )

    // Auto Next Song
    let index = songs.indexOf(`http://127.0.0.1:3000/%5Csongs%5C${currentFolder}%5C` + currentTrack.src.split(`${currentFolder}%5C`).slice(-1))
    if (index + 1 < songs.length && currentTrack.duration == currentTrack.currentTime) {
        console.log("done");
        currentTrack.pause()
        playSong(songs[index + 1].split(`${currentFolder}%5C`)[1].replaceAll("%20", " "))
    }
})

// Seekbar
document.querySelector(".seekbar-song").addEventListener("click", e => {
    let updatedTime = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector(".seek-song").style.left = `${updatedTime}%`
    currentTrack.currentTime = (currentTrack.duration * updatedTime) / 100
    if (currentTrack.paused) {
        currentTrack.play()
    }
})

// Volume Seek onClick
let volumeSeekBar = document.querySelector(".seekbar")
volumeSeekBar.addEventListener("click", e => {
    let updatedVol = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    let volImg = document.querySelector(".volume").firstElementChild

    if (updatedVol > 66) {
        volImg.src = "Assests/svg/volume3.svg";
    } else if (updatedVol > 33 && updatedVol <= 66) {
        volImg.src = "Assests/svg/volume2.svg";
    } else if (updatedVol > 0 && updatedVol <= 33) {
        volImg.src = "Assests/svg/volume1.svg";
    }

    document.querySelector(".seek").style.left = `${updatedVol}%`
})

// Song volume
volumeSeekBar.addEventListener("click", e => {
    let currentVol = document.querySelector(".seek").style.left
    currentVol = (currentVol.slice(0, currentVol.length - 1)) / 100;
    if (!mute) {
        currentTrack.volume = parseFloat(currentVol)
    }
})


// Hamburger
document.querySelector(".hamburger").addEventListener("click", e => {
    document.querySelector(".left").style.left = "0%"
    hamburgerOut = true
})
document.querySelector(".close").addEventListener("click", e => {
    document.querySelector(".left").style.left = "-100%"
    hamburgerOut = false
})
document.querySelector(".musicPlaylist").addEventListener("click", e => {
    if (hamburgerOut) {
        document.querySelector(".left").style.left = "-100%"
    }
})
document.addEventListener("click", (e) => {
    if (document.querySelector(".left").contains(e.target)) {
        document.querySelector(".left").style.left = "-100%"
    }
});


// Mute
document.querySelector(".volume").firstElementChild.addEventListener("click", e => {
    if (mute) {
        document.querySelector(".volume").firstElementChild.src = "Assests/svg/volume3.svg"
        let currentVol = document.querySelector(".seek").style.left
        currentVol = (currentVol.slice(0, currentVol.length - 1)) / 100;
        currentTrack.volume = parseFloat(currentVol)
        mute = false
    }
    else {
        document.querySelector(".volume").firstElementChild.src = "Assests/svg/mute.svg"
        currentTrack.volume = 0
        mute = true
    }
})



async function main() {
    await displayAlbumbs()
    // let audio = new Audio(songs[0])
    // audio.play()
}
main()



