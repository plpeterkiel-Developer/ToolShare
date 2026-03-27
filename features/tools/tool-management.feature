Feature: Tool management
  As a logged-in user
  I want to create, edit, and delete my tools
  So that I can manage my listings

  Background:
    Given the application is running
    And I am logged in as a registered user

  Scenario: Create a new tool
    When I navigate to "/da/tools/new"
    And I fill in the tool form with name "Test Power Drill" and category "Power Tools"
    And I submit the tool form
    Then I should be redirected to the tool detail page
    And I should see "Test Power Drill"

  Scenario: Required name validation on tool creation
    When I navigate to "/da/tools/new"
    And I submit the tool form without a name
    Then I should see a validation error for the name field

  Scenario: Edit an existing tool
    Given I have a tool listed called "My Hammer"
    When I navigate to the edit page of "My Hammer"
    And I change the tool name to "My Heavy Hammer"
    And I submit the tool form
    Then I should be redirected to the tool detail page
    And I should see "My Heavy Hammer"

  Scenario: Mark a tool as unavailable
    Given I have a tool listed called "My Wrench"
    When I navigate to the edit page of "My Wrench"
    And I set the availability to "unavailable"
    And I submit the tool form
    Then I should be redirected to the tool detail page
    And I should see the unavailable badge

  Scenario: Delete a tool
    Given I have a tool listed called "Old Saw"
    When I navigate to the detail page of "Old Saw"
    And I click the delete button
    And I confirm the deletion
    Then I should be redirected to the tools listing page
    And I should not see "Old Saw"

  Scenario: Cannot delete a tool with an active borrow request
    Given I have a tool listed called "Busy Drill"
    And there is an active borrow request for "Busy Drill"
    When I navigate to the detail page of "Busy Drill"
    And I click the delete button
    And I confirm the deletion
    Then I should see an error message containing "active borrow request"
    And the tool should still exist
