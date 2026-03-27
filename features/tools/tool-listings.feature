Feature: Tool listings
  As a visitor or logged-in user
  I want to browse available tools
  So that I can find something to borrow

  Background:
    Given the application is running
    And tools have been seeded in the database

  Scenario: Browse available tools on the tools page
    When I navigate to "/da/tools"
    Then I should see the tools listing page
    And I should see at least one tool card

  Scenario: View tool detail page
    When I navigate to the detail page of a seeded tool
    Then I should see the tool name
    And I should see the tool category
    And I should see the tool condition
    And I should see the owner's name

  Scenario: Owner sees edit controls on their own tool
    Given I am logged in as the tool owner
    When I navigate to the detail page of their tool
    Then I should see the edit button
    And I should see the delete button
    And I should not see the borrow request button

  Scenario: Non-owner cannot see edit controls
    Given I am logged in as a different user
    When I navigate to the detail page of a seeded tool owned by someone else
    Then I should not see the edit button
    And I should not see the delete button
    And I should see the request to borrow button
