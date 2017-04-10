var LoadingState = function () {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
};

LoadingState.prototype = {
    init: function () {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignVertically = true;
        game.scale.pageAlignHorizontally = true;
        game.scale.maxWidth = this.maxWidth;
        game.scale.maxHeight = this.maxHeight;
        //game.scale.startFullScreen(false);
    },

    preload: function() {
        game.load.image('loading', '/assets/preloader.gif');
    },

    create: function () {
        game.state.start('GameState');
    },

}
