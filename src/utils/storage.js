export const addItem = (location, id) => {
  const data = localStorage.getItem(location) ? JSON.parse(localStorage.getItem(location)) : [];
  data.push(id);
  localStorage.setItem(location, JSON.stringify(data));
}

export const getItems = (location) => localStorage.getItem(location) ? JSON.parse(localStorage.getItem(location)) : [];

export const removeItem = (location, id) => {
  const data = localStorage.getItem(location) ? JSON.parse(localStorage.getItem(location)) : [];
  localStorage.setItem(location,JSON.stringify(data.filter(item => item !== id)));
}