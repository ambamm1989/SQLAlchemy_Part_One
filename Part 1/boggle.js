class BoggleGame {
    constructor(boardId, secs = 60){
        this.secs = secs;
        this.showTime();
        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardId);

        this.timer = setInterval(this.tick.bind(this), 1000);
        $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
    }

    showWord(word){
        $(".words", this.board).append($("<li>", {text: word}));
    }

    showScore() {
        $(".score", this.board).text(this.score);
    }

    showMessages(message, cls ){
        $(".message", this.board)
        .text(message)
        .removeClass()
        .addClass(`message ${cls}`);
    }

    async handleSubmit(evt){
        evt.preventDefault();
        const $word = $(".word", this.board);
        let word = $word.val();
        if (!word) return;
        if(this.words.has(word)){
            this.showMessages(`Found already ${word}`, "error");
            return;
        }
        const resp = await axios.get("/check-word", {params: {word: word}});
        if (resp.data.result === "not-word"){
            this.showMessage(`${word} is not a English word`, "error");
        } else if(resp.data.result === "not-on-board"){
            this.showMessage(`${word} can't use word on board`, "error");
        }else{
            this.showWord(word);
            this.score += word.length;
            this.showScore();
            this.words.add(word);
            this.showMessage(`added: ${word}`, "ok");
        }
        $word.val("").focus();
    }
    showTime(){
        $(".time", this.board).text(this.secs);
    }

    async tick(){
        this.secs -= 1;
        this.showTime();
        if(this.secs === 0){
            clearInterval(this.time);
            await this.scoreGame();
        }
    }
    async scoreGame(){
        $(".add-word", this.board).hide();
        const resp = await axios.post("/post-score", {score: this.score});
        if(resp.data.recordBorken){
            this.showMessage(`New Record: ${this.score}`, "ok");
        }else{
            this.showMessage(`Final Score:` ${this.score}, "ok");
        }
    }
}