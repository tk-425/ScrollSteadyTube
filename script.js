window.addEventListener('load', () => {
  const elmColors = document.getElementsByName('change');

  for (const element of elmColors) {
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
      playerElement.style.top = '56px';
      playerElement.style.position = 'sticky';
      playerElement.style.zIndex = '1000';
      playerElement.style.backgroundColor = 'black';
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
        const playerContainer = document.querySelector('#page-manager');
        const theaterButton =
          document.getElementsByClassName('ytp-size-button')?.[0];
        const childClasses = 'style-scope ytd-page-manager hide-skeleton';
        const box = playerContainer.getElementsByClassName(childClasses);

        // Enabling Theater mode
        if (theaterButton.getAttribute('title') === 'Theater mode (t)') {
          theaterButton.click?.();
        }

        setTimeout(() => {
          // childNodes[13] is the video div element
          const targetElement = box[0].childNodes[13];

          if (targetElement) {
            console.log('changing player style');
            changePlayerStyle(targetElement);
          } else {
            setTimeout(() => {
              changePlayerStyle(targetElement);
            }, 2000);
          }
        }, 1000);
      })
      .catch((error) => {
        console.error('An error occurred:', error);
      });
  }
});
