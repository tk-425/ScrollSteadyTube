function injectStyle(container) {
  const playerContainer = document.querySelector(container);
  const childClasses = 'style-scope ytd-page-manager hide-skeleton';
  const box = playerContainer.getElementsByClassName(childClasses);

  console.log('injectStyle()');

  console.log(box);

  function changePlayerStyle(playerElement) {
    try {
      playerElement.style.top = '56px';
      playerElement.style.position = 'sticky';
      playerElement.style.zIndex = '1000';
      playerElement.style.backgroundColor = 'black';
    } catch (error) {}
  }

  function changeCinematicStyle(playerElement) {
    try {
      playerElement.style.position = 'fixed';
      playerElement.style.zIndex = '100';
    } catch (error) {}
  }

  setTimeout(() => {
    let playerWideContainer, player, cinematicContainer;

    try {
      // wide-player element when is in theater mode
      playerWideContainer = box[0].childNodes[15];

      // default-player element
      player = box[0].childNodes[19].childNodes[1].childNodes[1].childNodes[1];

      // background element of default-player
      cinematicContainer = player.childNodes[1];
    } catch (error) {}

    if (playerWideContainer) {
      changePlayerStyle(playerWideContainer);
    } else {
      setTimeout(() => {
        changePlayerStyle(playerWideContainer);
      }, 2000);
    }

    if (player) {
      changePlayerStyle(player);
      changeCinematicStyle(cinematicContainer);
    } else {
      setTimeout(() => {
        changePlayerStyle(player);
        changeCinematicStyle(cinematicContainer);
      }, 2000);
    }
  }, 1000);
}

let observer = new MutationObserver((mutation) => {
  if (document.querySelector('#page-manager')) {
    injectStyle('#page-manager');
    observer.disconnect();
    startObserving();
  }
});

function startObserving() {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

startObserving();
