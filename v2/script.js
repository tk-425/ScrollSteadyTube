console.log('Content script loaded!');

function injectStyle(container) {
  console.log('Injecting style');

  const playerContainer = document.querySelector(container);
  const childClasses = 'style-scope ytd-page-manager hide-skeleton';
  const box = playerContainer.getElementsByClassName(childClasses);

  function changePlayerStyle(playerElement) {
    console.log(playerElement);
    playerElement.style.top = '56px';
    playerElement.style.position = 'sticky';
    playerElement.style.zIndex = '1000';
    playerElement.style.backgroundColor = 'black';
  }

  function changeCinematicStyle(playerElement) {
    console.log(playerElement);
    playerElement.style.position = 'fixed';
    playerElement.style.zIndex = '100';
  }

  setTimeout(() => {
    // wide-player element when is in theater mode
    const playerWideContainer = box[0].childNodes[13];
    // default-player element
    const player =
      box[0].childNodes[17].childNodes[1].childNodes[1].childNodes[1];
    // background element of default-player
    const cinematicContainer = player.childNodes[1];

    if (playerWideContainer) {
      console.log('changing player wide style');
      changePlayerStyle(playerWideContainer);
    } else {
      setTimeout(() => {
        changePlayerStyle(playerWideContainer);
      }, 2000);
    }

    if (player) {
      console.log('changing player style');
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
    console.log('#page-manager found');

    injectStyle('#page-manager');

    observer.disconnect();
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
});
