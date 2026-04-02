Feature: Security
  As a platform operator
  I want to enforce authentication and authorisation rules
  So that users cannot access or modify resources they do not own

  Background:
    Given the application is running

  # --- Authentication ---

  Scenario: Unauthenticated user is redirected from protected pages
    Given I am not logged in
    When I navigate to "/da/tools/new"
    Then I should be redirected to the login page

  Scenario: Unauthenticated user cannot access requests page
    Given I am not logged in
    When I navigate to "/da/requests"
    Then I should be redirected to the login page

  # --- Authorisation ---

  Scenario: User cannot edit another user's tool listing
    Given I am logged in as a borrower
    And there is a tool owned by a different user
    When I navigate to the edit page for that tool
    Then I should see an error or be redirected away

  Scenario: User cannot approve requests on another user's tool
    Given I am logged in as a borrower
    And there is a pending borrow request for a tool I do not own
    When I attempt to approve the request
    Then the action should be denied

  Scenario: User cannot delete another user's tool listing
    Given I am logged in as a borrower
    And there is a tool owned by a different user
    When I attempt to delete that tool
    Then the action should be denied

  # --- Address privacy ---

  Scenario: Pick-up address is hidden until request is approved
    Given I am logged in as a borrower
    And I have a pending borrow request for a tool
    When I navigate to the tool detail page
    Then I should not see the pick-up address

  # --- Admin access ---

  Scenario: Non-admin cannot access admin pages
    Given I am logged in as a regular user
    When I navigate to "/da/admin"
    Then I should be redirected away from the admin area
