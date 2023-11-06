window.addEventListener('load', () => {
  const changeStyle = document.getElementsByName('change');

  for (const element of changeStyle) {
    element.onclick = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: enable,
          args: [''],
        });
      });
    };
  }

  function enable() {
    console.log('Window loaded');

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

    // wait until passed selector is finished loading
    function waitForElement(selector) {
      return new Promise((res) => {
        const element = document.querySelector(selector);

        // if selector is available, return the html element
        if (element) {
          res(element);
          return;
        }

        // if selector is not available, create an observer instance
        const observer = new MutationObserver((mutation) => {
          const targetElement = document.querySelector(selector);

          if (targetElement) {
            res(targetElement);
            observer.disconnect();
          }
        });

        // start observing the target node
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      });
    }

    waitForElement('#page-manager')
      .then((container) => {
        console.log(container);

        const playerContainer = document.querySelector('#page-manager');
        const childClasses = 'style-scope ytd-page-manager hide-skeleton';
        const box = playerContainer.getElementsByClassName(childClasses);

        setTimeout(() => {
          // wide-player element when is in theater mode
          const playerWideContainer = box[0].childNodes[15];
          // default-player element
          const player =
            box[0].childNodes[19].childNodes[1].childNodes[1].childNodes[1];
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
      })
      .catch((error) => {
        console.error('An error occurred:', error);
      });
  }
});
