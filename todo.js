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
/- Prevent Refreshing the page when user pulls down the page

? QR Menu
- How item will look without image or description
- test back button that will close modal on ios and different browsers
/- Add Search meal by name field (Think about it) -- Not feasible
- check what happens if a meal gets deleted while its in cart
/- changing meal status causing the qr-menu to reset back to default language
- Add scroll to "add meal" drawer when the meal is too long to fit the screen, caused by long description or too many portions
- QR #0 - the QR Menu Only, should not have active listener to menu changes (this to reduce number of  firestore reads)
- QR Menu only should show everything in the menu, no "Out of Stock" or "Not Available" meals should be shown, meal is either enabled or disabled

? Staff Dashboard
/- either add "search bar" or "filter meals" drawer, or both

? Menu
- Fix Section Title Edit


? Branch
- Show Mock image if no image is uploaded
- Allow Branch Admin to Close Table Order from dashboard -- Close only, no collect payment is allowed
/- Add "Skip Kitchen" toggle to the branch

? Meals
/- Translate Meal Portions (Not feasible as it will require a lot of work)
/- Remove "gram"

? Business Profile
1- Adding new logo issue when navigating to another tab then coming back
2- Upgrade/Downgrade Plan
3- Payment info
4- Add sub users
5- Create a firebase schedule function to check if the plan is expired or not
6- prevent uploading svg images

---------------------------------------------------------------------------
! TESTING
1- Test all Array.maps when there are no data to present

* Next Release
1- Get Customer Feedback
2- Sub-users, Limit sub-users access to specific branches
3- Allow customers to register and show past orders and favorite meals
*/
