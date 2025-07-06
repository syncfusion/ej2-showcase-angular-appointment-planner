### Feature description

Clearly and concisely describe the problem or feature (this cannot be empty).

### Analysis and design

If there is an external design, link to its project documentation area.
If there is an internal discussion on the forum, provide the link.

### Solution description

Describe your code changes in detail for reviewers.

### Output screenshots

Post the output screenshots if an UI is affected or added due to this feature.

### Areas affected and ensured

List the areas are affected by your code changes.

### Test cases

Provide the unit testing written file details to understand the use cases considered in this implementation.
If there is no TDD (if it’s not possible to follow), provide the UI automation script location and the Excel file that contains the use cases considered in this implementation.
Provide the test cases Excel file alone if the feature cannot be automated in any case.

### Test bed sample location

Provide the test bed sample location where code reviewers can review the new feature’s behaviors. This depends on the CI process that your team follows. It can be from NPMCI, HockeyApp, staging site, local server, etc.

### Additional checklist

  - Did you run the automation against your fix?
  - Is there any API name change?
  - Is there any existing behavior change of other features due to this code change?
  - Does your new code introduce new warnings or binding errors?
  - Does your code pass all FxCop and StyleCop rules?
  - Did you record this case in the unit test or UI test?