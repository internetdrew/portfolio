const topButton = document.querySelector('#top-arrow');

function toggleTopButton() {
  if (document.documentElement.scrollTop <= 150) {
    topButton.style.display = 'none';
  } else {
    topButton.style.display = 'block';
  }
}
toggleTopButton();

function scrollToTop() {
  window.scrollTo(0, 0);
}

topButton.addEventListener('click', scrollToTop);
document.addEventListener('scroll', toggleTopButton);
