Feature: Moderation
  As a platform administrator
  I want to review reports and take action on violations
  So that the community remains safe and trustworthy

  Background:
    Given the application is running

  Scenario: User reports an inappropriate tool listing
    Given I am logged in as a regular user
    And I am viewing a tool listing owned by another user
    When I click the report button and submit a reason
    Then I should see a confirmation that the report was submitted
    And the listing should remain visible

  Scenario: Admin reviews and resolves a report with a warning
    Given I am logged in as an admin
    And there is a pending report against a user
    When I navigate to "/da/admin/reports"
    And I select "Issue Warning" for the report
    And I confirm the action
    Then the report status should change to resolved
    And the reported user should have an increased warning count

  Scenario: Admin removes a reported tool listing
    Given I am logged in as an admin
    And there is a pending report against a tool listing
    When I navigate to "/da/admin/reports"
    And I select "Remove Content" for the report
    And I confirm the action
    Then the tool listing should no longer appear on the browse page
    And the report status should change to resolved

  Scenario: Admin suspends a user for a major violation
    Given I am logged in as an admin
    And there is a pending report against a user
    When I navigate to "/da/admin/users"
    And I suspend the reported user's account
    Then the user's account status should show as suspended
    And the suspended user should not be able to log in

  Scenario: Non-admin cannot access the reports page
    Given I am logged in as a regular user
    When I navigate to "/da/admin/reports"
    Then I should be redirected away from the admin area
