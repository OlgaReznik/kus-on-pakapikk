export const byId = (id) => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Element #${id} puudub lehelt`);
  return element;
};

export const show = (element) => element.classList.remove('hidden');
export const hide = (element) => element.classList.add('hidden');
export const setVisible = (element, visible) => element.classList.toggle('hidden', !visible);

export function onEnter(input, handler) {
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handler();
  });
}

export function setMessage(element, text, tone = 'info') {
  element.textContent = text;
  element.classList.remove('message--error', 'message--ok', 'message--info');
  element.classList.add(`message--${tone}`);
}
