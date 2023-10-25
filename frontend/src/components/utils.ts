import { IStatus } from './types';

export function fetchJSON(
  url: string | URL,
  payload: any = {},
  onSuccess: (data: any) => void,
  onError: (error: IStatus) => void
) {
  return fetch(url, payload)
    .then(function (response) {
      if (response.status !== 200) {
        console.log(
          'Looks like there was a problem. Status Code: ' + response.status,
          response
        );
        response.json().then(function (data) {
          console.log('Error data', data);
        });
        onError({
          status: false,
          message:
            'Connection error ' + response.status + ' ' + response.statusText
        });
        return;
      }
      return response.json().then(function (data) {
        onSuccess(data);
      });
    })
    .catch(function (err) {
      console.log('Fetch Error :-S', err);
      onError({
        status: false,
        message: `There was an error connecting to server. (${err}) `
      });
    });
}
export const capitalize = (s: string) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};
