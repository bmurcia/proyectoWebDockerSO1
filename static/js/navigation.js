export function setupNavigation() {
  document.querySelectorAll('.sidebar-btn').forEach(button => {
    button.addEventListener('click', () => {
      const sectionId = button.dataset.section;
      document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
      const active = document.getElementById(sectionId);
      if (active) {
        active.classList.add('active');
        active.focus();
      }

      document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });
}
