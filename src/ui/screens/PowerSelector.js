import { POWERS } from '../../game/powers/registry.js';

// Swipeable one-at-a-time carousel for choosing a power on the setup screen.
// Scrolling only changes which card is centered/previewed — it never
// changes the confirmed selection. Only the "Select This Power" button
// commits the centered card via onConfirm.
export function initPowerSelector({ onConfirm }) {
  const root = document.getElementById('power-selector-slot');
  root.innerHTML = '';
  root.classList.add('power-selector');

  const wrapper = document.createElement('div');
  wrapper.className = 'power-carousel-wrapper';

  const arrowLeft = document.createElement('button');
  arrowLeft.type = 'button';
  arrowLeft.className = 'power-arrow power-arrow-left';
  arrowLeft.setAttribute('aria-label', 'Previous power');
  arrowLeft.textContent = '‹';

  const track = document.createElement('div');
  track.className = 'power-carousel';
  track.setAttribute('role', 'listbox');

  const arrowRight = document.createElement('button');
  arrowRight.type = 'button';
  arrowRight.className = 'power-arrow power-arrow-right';
  arrowRight.setAttribute('aria-label', 'Next power');
  arrowRight.textContent = '›';

  const cards = POWERS.map((power) => {
    const card = document.createElement('div');
    card.className = 'power-card';
    card.setAttribute('role', 'option');

    const icon = document.createElement('img');
    icon.className = 'power-card-icon';
    icon.src = power.icon;
    icon.alt = power.name;

    const name = document.createElement('h3');
    name.className = 'power-card-name';
    name.textContent = power.name;

    const desc = document.createElement('p');
    desc.className = 'power-card-desc';
    desc.textContent = power.description;

    card.append(icon, name, desc);
    track.appendChild(card);
    return card;
  });

  const dots = document.createElement('div');
  dots.className = 'power-dots';
  const dotEls = POWERS.map(() => {
    const dot = document.createElement('span');
    dot.className = 'power-dot';
    dots.appendChild(dot);
    return dot;
  });

  const confirmButton = document.createElement('button');
  confirmButton.type = 'button';
  confirmButton.className = 'btn btn-secondary power-confirm-btn';
  confirmButton.textContent = 'Select This Power';

  wrapper.append(arrowLeft, track, arrowRight);
  root.append(wrapper, dots, confirmButton);

  let centeredIndex = 0;

  function computeCenteredIndex() {
    if (cards.length === 0) return 0;
    // Use viewport rects rather than offsetLeft/scrollLeft: offsetLeft is
    // relative to the nearest *positioned* ancestor, which here is the
    // fixed `.screen` container rather than the scrolling track, so it and
    // scrollLeft live in unrelated coordinate spaces once the track scrolls.
    const containerCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(cardCenter - containerCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });
    return closestIndex;
  }

  function updateDots() {
    dotEls.forEach((dot, i) => dot.classList.toggle('active', i === centeredIndex));
  }

  function updateArrows() {
    arrowLeft.disabled = centeredIndex <= 0;
    arrowRight.disabled = centeredIndex >= cards.length - 1;
  }

  // Blue "previewed" ring follows whichever card is centered, independent of
  // the green "selected" ring which only moves on confirm.
  function updatePreview() {
    cards.forEach((card, i) => card.classList.toggle('previewed', i === centeredIndex));
  }

  function onScroll() {
    centeredIndex = computeCenteredIndex();
    updateDots();
    updateArrows();
    updatePreview();
  }

  let scrollTimer = null;
  track.addEventListener(
    'scroll',
    () => {
      if (scrollTimer) cancelAnimationFrame(scrollTimer);
      scrollTimer = requestAnimationFrame(onScroll);
    },
    { passive: true }
  );

  function scrollToIndex(index) {
    const clamped = Math.max(0, Math.min(cards.length - 1, index));
    cards[clamped]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  arrowLeft.addEventListener('click', () => scrollToIndex(centeredIndex - 1));
  arrowRight.addEventListener('click', () => scrollToIndex(centeredIndex + 1));

  confirmButton.addEventListener('click', () => {
    cards.forEach((card, i) => card.classList.toggle('selected', i === centeredIndex));
    onConfirm(POWERS[centeredIndex]?.id ?? null);
  });

  updateDots();
  updateArrows();
  updatePreview();

  return {
    reset() {
      centeredIndex = 0;
      cards.forEach((card) => card.classList.remove('selected'));
      track.scrollTo({ left: 0 });
      updateDots();
      updateArrows();
      updatePreview();
    },
  };
}
