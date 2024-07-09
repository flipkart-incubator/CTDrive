# CT Drive - Tech Doc

#### Getting Started :

- <p>For getting started to build an application like ct drive you need to have some knowledge regarding the google oauth web services.<p>
- <p>This is the ct drive repository that has code for the existing application <a href="https://bitbucket.org/cleartrip/ct-google-drive/src/main/">Link</a>.</p>
- <p>You can clone this repository and run it in your local.</p>
- <p>For running this application you need to add the following credentials to the file .env.production <ul><li>VITE_GOOGLE_CLIENT_ID</li>
    <li>VITE_ROOT_ORG_FOLDER_ID</li></ul>
- <p>To add these credentials you can go through the following website link <a href="https://developers.google.com/identity/protocols/oauth2/web-server">Using OAuth 2.0 for Web Server Applications | Authorization | Google for Developers</a></p>
- <p>In this website you can find an option of create authorization credentials and once you click on the link you will landed to console.google.cloud.com page where you can create a project and from there you can get the VITE_GOOGLE_CLIENT_ID.</p>
- <p>For the second credential you can add the id of the main folder that you wanted to open once you run the project.</p>
- <p>To run the project you have to initially run 2 commands<ul>
         <li><strong>yarn install</strong> - this will install all the dependencies required for the project to run.</li>
      <li><strong>yarn run dev</strong> - this will run the code</li></ul></p>
- <p>By default the project will be opened in <a href="http://localhost:5173">Link</a></p>

#### TechStack :

<ul>
<li><ul><strong>React : </strong>
<li>React is a JavaScript library for building user interfaces, commonly used for creating single-page applications.</li>
<li>It allows developers to create reusable UI components that manage their own state, making it easier to build complex UIs.</li>
<li>For further reference :<a href="https://react.dev/"> React</a></li></ul></li>
<li><ul><strong>Typescript  : </strong>
<li>TypeScript is a superset of JavaScript that adds static typing to the language.</li>
<li>It helps catch errors early in the development process and improves code readability and maintainability.</li>
<li>For further reference : <a href="https://www.typescriptlang.org/">TypeScript</a></li></ul></li>
<li><ul><strong>Zustand : </strong>
<li>Zustand is a small, fast, and scalable state management library for React applications.</li>
<li>It provides a simple API for managing state in React components without the need for additional dependencies like Redux.</li>
<li>Zustand is used for state management.</li>
<li>For further reference : <a href="https://github.com/pmndrs/zustand">GitHub - pmndrs/zustand: 🐻 Bear necessities for state management in React</a></li></ul></li>
<li><ul><strong>Ant Design : </strong>
<li>Ant Design is a React UI library with a set of high-quality components and design principles.</li>
<li>It helps developers build beautiful and accessible user interfaces quickly and easily.</li>
<li>For further reference : <a href="https://ant.design/">Ant Design</a></li></ul></li>
<li><ul><strong>Tailwind CSS : </strong>
<li>Tailwind CSS is a utility-first CSS framework that allows you to build custom designs without having to write traditional CSS.</li>
<li>It provides a set of utility classes that you can use to style your components, resulting in a more maintainable and consistent codebase.</li>
<li>For further reference : <a href="https://tailwindcss.com/">Tailwind CSS</a></li></ul></li>
<li><ul><strong>Vite : </strong>
<li>Vite is a build tool for modern web development that focuses on speed and simplicity.</li>
<li>It leverages ES modules to provide fast, hot module replacement during development and optimized production builds.</li>
<li>For further reference : <a href="https://vitejs.dev/">Vite</a></li></ul></li>
<li><ul><strong>Google OAuth / Google Drive APIs : </strong>
<li>Google OAuth allows you to authenticate users and access google APIs on their behalf successfully.</li>
<li>Google Drive API enables developers to interact with files and folders stored in google drive programmatically.</li>
<li><ul>For further reference : 
<li><strong>Google OAuth : </strong><a href="https://developers.google.com/identity/protocols/oauth2">Using OAuth 2.0 to Access Google APIs | Authorization</a></li>
<li><strong>Google Drive : </strong><a href="https://developers.google.com/drive">Google Drive</a></li></ul></li></ul></li></ul>

#### APIs Used :

<ul>
<li><ul><strong>GAPI : </strong>
<li>GAPI is Google’s client library for browser-side JavaScript. It’s used in Google Sign-in, Google Drive, and thousands of internal and external web pages for easily connecting with Google APIs.</li>
<li>Initially define a script to create the gapi object in index.html file.</li>
<li>Load the client using api call -  window.gapi.load</li>
<li>Once loaded initialize the google client using the api call - window.gapi.client.init which accepts the params client id(VITE_GOOGLE_CLIENT_ID), scope,discovery docs and plugin name.</li></ul></li>
<li><ul><strong>Login : </strong>
<li>For login we use the api call window?.gapi.auth2.getAuthInstance();</li>
<li>gapi.auth2.getAuthInstance() returns a Google Auth object. This object is used to call the sign-in method.</li>
<li>On success we will get the user details and display the information.</li></ul></li>
<li><ul><strong>Get : </strong>
<li>To get the details of any file/folder we will use the api call window.gapi.client.drive.files.get</li>
<li>We will pass the params folder Id and required fields for getting information.</li></ul></li>
<li><ul><strong>List : </strong>
<li>To get the list of files or folders present in a directory we use window.gapi.client.drive.files.list </li>
<li>This method returns all the files in a list which will be mapped to show</li>
<li>This method accepts different parameters like query,order by,fields,pageSize based on which it returns the list of files/folders</li></ul></li>
<li><ul><strong>Create : </strong>
<li>To create a new file/folder we will use window.gapi.client.drive.files.create</li>
<li>This method accepts params like mimeType,parentId,name,fields</li>
<li>This method creates a new file/folder based on the params given</li></ul></li>
<li><ul><strong>Update : </strong>
<li>To update the name or status of file/folder we use window.gapi.client.drive.files.update</li>
<li>This method updates the required field keeping all the other fields same</li></ul></li>
<li><ul><strong>Delete : </strong>
<li>To permanently delete a file/folder we use window.gapi.client.drive.files.delete</li>
<li>This method deletes the file/folder which cannot be restored later</li></ul></li>
<li><ul><strong>Permissions : </strong>
<li>To create/update permissions we use window.gapi.client.drive.permissions.create / window.gapi.client.drive.permissions.update</li>
<li>This method is majorly used to share the file/folder with people or update the permissions</li></ul></li>
<li><ul><strong>People Search: </strong>
<li>To search people for sharing the file we are using window.gapi.client?.people?.people?.searchDirectoryPeople, window?.gapi?.client?.people.otherContacts.search</li>
<li>This method accepts the params query,readMask,sources,pageSize</li>
<li>This method gives a list of contacts based on our params</li>
</ul></li>
</ul>
