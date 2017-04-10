var LoadingState = function () {

};

LoadingState.prototype = {
    init: function () {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignVertically = true;
        game.scale.pageAlignHorizontally = true;
        game.scale.maxWidth = maxWidth;
        game.scale.maxHeight = maxHeight;
        //game.scale.startFullScreen(false);
    },

    preload: function() {
        game.load.image('loading', '/assets/preloader.gif');
    },

    create: function () {
        game.state.start('GameState');
    },

}
