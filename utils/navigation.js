const screens = [...document.querySelectorAll('.screen')]; // 0 - home, 1 - game, 2 - end

const changeScreen = (screenIndex) => {
    const isPlaying = screenIndex === 1 ? true : false;
    screens.forEach((screen, index) => {
        if (screenIndex === index) {
            screen.classList.remove('hidden');
        } else {
            screen.classList.add('hidden');
        }
    });

    return isPlaying;
};

const isScreenShowing = (screenIndex) => {
    const screen = screens[screenIndex];
    return !screen.classList.contains('hidden');
};

export { changeScreen, isScreenShowing };
