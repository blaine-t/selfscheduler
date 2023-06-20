const eventSource = new EventSource('/sse');

eventSource.addEventListener('notification', (event) => {
  const message = event.data;
  console.log(message.replaceAll('💀', '\n'))
});