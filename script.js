const video = document.getElementById('videoPlayer');
const canvas = document.getElementById('subtitleCanvas');
const ctx = canvas.getContext('2d');

const startSlider = document.getElementById('startSlider');
const endSlider = document.getElementById('endSlider');
const rangeHighlight = document.getElementById('rangeHighlight');
const rangeMarks = document.getElementById('rangeMarks');
const subtitleInput = document.getElementById('subtitleInput');
const addSubtitleButton = document.getElementById('addSubtitle');
const subtitleList = document.getElementById('subtitleList');

window.addEventListener('resize', () => {
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
});

let subtitles = [
    {
        id: '1',
        text: 'Hello everyone! Nice to meet you here in my video',
        start: 0,
        end: 10,
    },
    {
        id: '2',
        text: 'Have fun watching this video ;)',
        start: 10,
        end: 20,
    },
];
let selectedSubtitle = null;

function renderSubtitles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentTime = video.currentTime;

    subtitles.forEach(sub => {
        if (currentTime >= sub.start && currentTime <= sub.end) {
            ctx.font = '16px Arial';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText(sub.text, canvas.width / 2, canvas.height - 50);
        }
    });
}

function renderSubtitleList() {
    subtitleList.innerHTML = '';
    const _subs = [...subtitles];
    _subs.sort((a, b) => a.start - b.start)
    _subs.forEach((sub, index) => {
        const li = document.createElement('li');
        li.textContent = `${sub.text} (${sub.start.toFixed(2)}s - ${sub.end.toFixed(2)}s)`;
        li.classList.add('sub');
        li.dataset.id = sub.id;
        if (selectedSubtitle?.dataset.id === sub.id) {
            li.classList.add('active');
        }
        li.addEventListener('click', () => {
            selectSubtitle(li, sub);
        });
        subtitleList.appendChild(li);
    });
}

function selectSubtitle(el, sub) {
    document.querySelector('.sub.active')?.classList.remove('active')
    selectedSubtitle = el;
    selectedSubtitle.classList.add('active');
    selectedSubtitle.dataset.id = sub.id;
    subtitleInput.value = sub.text;
    startSlider.value = (sub.start / video.duration) * 100;
    endSlider.value = (sub.end / video.duration) * 100;
    updateRangeHighlight();
}

function updateRangeHighlight() {
    const startPercent = parseFloat(startSlider.value);
    const endPercent = parseFloat(endSlider.value);

    rangeHighlight.style.left = `${startPercent}%`;
    rangeHighlight.style.width = `${endPercent - startPercent}%`;
}

function renderRangeMarks() {
    rangeMarks.innerHTML = '';
    
    subtitles.forEach(sub => {
        const startPercent = sub.start ? ((sub.start / video.duration) * 100) : 0;
        const endPercent = (sub.end / video.duration) * 100;
        // debugger
        const mark = document.createElement('div');
        mark.classList.add('mark')
        mark.style.left = `${startPercent}%`;
        mark.style.width = `${endPercent - startPercent}%`;
        rangeMarks.appendChild(mark);
    });
}

function isOverlapping(start, end) {
    return subtitles.some(sub => {
        return (start < sub.end && end > sub.start);
    });
}

startSlider.addEventListener('input', () => {
    // debugger
    if (parseFloat(startSlider.value) >= parseFloat(endSlider.value)) {
        startSlider.value = endSlider.value - 0.01;
    }

    const start = (parseFloat(startSlider.value) / 100) * video.duration;
    video.currentTime = start;

    updateRangeHighlight();
    if (selectedSubtitle) selectedSubtitle.start = start;
});

endSlider.addEventListener('input', () => {
    // debugger
    if (parseFloat(endSlider.value) <= parseFloat(startSlider.value)) {
        endSlider.value = startSlider.value + 0.01;
    }

    const end = (parseFloat(endSlider.value) / 100) * video.duration;
    video.currentTime = end;

    updateRangeHighlight();
    if (selectedSubtitle) selectedSubtitle.end = end;
});

addSubtitleButton.addEventListener('click', () => {
    const subtitleText = subtitleInput.value;
    if (!subtitleText) return;

    const start = (parseFloat(startSlider.value) / 100) * video.duration;
    const end = (parseFloat(endSlider.value) / 100) * video.duration;

    if (selectedSubtitle) {
         // update
        subtitles = subtitles.map((sub) => {
            if (sub.id === selectedSubtitle.dataset.id) {
                return {
                    id: sub.id,
                    text: subtitleText,
                    start: start,
                    end: end
                }
            }

            return sub;
        })
        selectedSubtitle = null
        renderSubtitleList();
        renderRangeMarks(); 
        subtitleInput.value = '';
    } else if (start < end && (!isOverlapping(start, end))) {
        // create
        const newSubtitle = {
            id: String(Math.floor(Math.random() * 10_000)),
            text: subtitleText,
            start: start,
            end: end
        };
        subtitles.push(newSubtitle);
        renderSubtitleList();
        renderRangeMarks(); 
        subtitleInput.value = '';
    } else {
        alert('Invalid range or overlapping with existing subtitle.');
    }
});

video.addEventListener('timeupdate', () => {
    renderSubtitles();
    if (selectedSubtitle) {
        if (selectedSubtitle.start) {
            startSlider.value = (selectedSubtitle.start / video.duration) * 100;
        }
        if (selectedSubtitle.end) {
            endSlider.value = (selectedSubtitle.end / video.duration) * 100;
        }
        updateRangeHighlight();
    }
});

video.addEventListener('loadedmetadata', () => {
    renderSubtitleList();    
    renderRangeMarks();
    
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
})

document.addEventListener('DOMContentLoaded', () => {      
    updateRangeHighlight(); 
    renderSubtitleList();    
    renderRangeMarks();

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    
})

