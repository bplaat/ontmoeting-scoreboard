function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let ws;

const app = new Vue({
    el: '#app',
    data: {
        teams: [],
        currentSlide: 0,
        interval: null,
    },

    mounted() {
        this.connect();
        setTimeout(this.nextSlide.bind(this), 5000);
    },

    methods: {
        connect() {
            ws = new WebSocket('ws://localhost:8080');
            ws.onmessage = this.onMessage.bind(this);
        },

        onMessage(event) {
            const { type, data } = JSON.parse(event.data);
            console.log(type, data);
            if (type === 'teams') {
                for (const team of data) {
                    const existing = this.teams.find((t) => t.id === team.id);
                    if (existing) {
                        existing.score = team.score;
                    } else {
                        team.currentImage = rand(0, team.images.length - 1);
                        this.teams.push(team);
                    }
                }
            }
        },

        nextSlide() {
            this.currentSlide = (this.currentSlide + 1) % (this.teams.length + 1);
            if (this.currentSlide !== 0) {
                const team = this.teams[this.currentSlide - 1];
                team.currentImage = rand(0, team.images.length - 1);
            }
            setTimeout(this.nextSlide.bind(this), this.currentSlide === 0 ? 5000 : 2000);
        },
    },
});
