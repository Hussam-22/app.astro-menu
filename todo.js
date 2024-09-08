/* 
# TODO List

? System
1- Unify all Icons
2- Unify all Colors
3- Unify all Tabs Names
4- Add Delete logic to all delete buttons
5- Update Browser Tab Title
6- Add Confirmation Modals to all Delete actions
7- Remove all docID when not needed
8- Translate all static text
9- Improve snackbars colors and text
1- improve the loading for all components visually
- All Notifications should be in the same place (Bottom center)
/- Prevent Refreshing the page when user pulls down the page
- show error messages such as "user already in use" in registration form

? QR Menu
- How item will look without image or description
- test back button that will close modal on ios and different browsers
/- Add Search meal by name field (Think about it) -- Not feasible
- check what happens if a meal gets deleted while its in cart
/- changing meal status causing the qr-menu to reset back to default language
/- Add scroll to "add meal" drawer when the meal is too long to fit the screen, caused by long description or too many portions
- QR #0 - the QR Menu Only, should not have active listener to menu changes (this to reduce number of  firestore reads)
- QR Menu only should show everything in the menu, no "Out of Stock" or "Not Available" meals should be shown, meal is either enabled or disabled
/- fix menu-sections drawer gets duplicated when disabling section from "Menu > Meals and Sections" in the dashboard

? Staff Dashboard
/- either add "search bar" or "filter meals" drawer, or both
/- auto login for staff
/- "quick add" portion directly from meal card
- show a dialog when changing meal status, stating that changing the meal to "unable to serve" will remove it from all carts immediately
- search menu meals
- in orders history, when the canceled order cart is empty, it will show and error of "one of the meals were deleted", display another message.


? Menu
- Fix Section Title Edit
- when menu has no sections or all sections have no meals, disable menu for customers.
- Show alert message when menu is in use does not have any sections or meals


? Branch
- Show Mock image if no image is uploaded
- Allow Branch Admin to Close Table Order from dashboard -- Close only, no collect payment is allowed
/- Add "Skip Kitchen" toggle to the branch
- branch copy qr link not working on tablet
- tables turnover calculation, add total time to branch document, then divide by total orders to reduce reads
- for "limit scans" plan, show a message to the user that they have reached their limit
- for "limit scans" plan, show remaining scans in the dashboard
- for "limit scans" plan, send an email when the user reaches 80% of their limit
- for "limit scans" plan, when limit is reached, disable branch
- when switching plan to coffee cup, hide extra tables and disable them
- when switching plan to coffee cup, remove extra languages
- fix table order details, and use minutes instead of days for duration
- Branch Statistics tab, calculate start period to start on the business profile subscription date start instead of 2023 for all
- Fix QR orders that has no "Initial time" or "End time" in the order details

? Meals
/- Translate Meal Portions (Not feasible as it will require a lot of work)
/- Remove "gram"
/- Think about meal price and how will affecting branches from different countries (Each menu now can have different pricing sets for the same meal)
- Make "Description" optional field and check translation

? Business Profile
- Add sub users
- prevent uploading svg images
- add password reset link
- add "Close account" button
!- Fix Default Language incase the user has default language other than English
- make sure only available languages are shown in the dropdown for the translation
/- Adding new logo issue when navigating to another tab then coming back
/- Upgrade/Downgrade Plan --> available in stripe
/- Payment info --> available in stripe
/- Create a firebase schedule function to check if the plan is expired or not --> available in stripe
/- add "cancel subscription" button --> available in stripe


---------------------------------------------------------------------------
! TESTING
1- Test all Array.maps when there are no data to present

* Next Release
1- Get Customer Feedback
2- Sub-users, Limit sub-users access to specific branches
3- Allow customers to register and show past orders and favorite meals
*/
