Feature: Borrow requests
  As a logged-in user
  I want to submit and manage borrow requests
  So that I can borrow tools from other members

  Background:
    Given the application is running

  Scenario: Submit a borrow request for an available tool
    Given I am logged in as a borrower
    And there is an available tool owned by a different user
    When I navigate to the tool detail page
    And I click the request to borrow button
    And I fill in the borrow request form
    And I submit the borrow request
    Then I should see a request sent confirmation
    And the request should appear in my outgoing requests

  Scenario: Cannot request own tool
    Given I am logged in as the tool owner
    When I navigate to the detail page of my own tool
    Then I should not see the request to borrow button

  Scenario: Owner approves a borrow request
    Given I am logged in as the tool owner
    And there is a pending borrow request for my tool
    When I navigate to "/da/requests"
    And I click the approve button for the pending request
    Then the request status should change to "Approved"

  Scenario: Owner denies a borrow request
    Given I am logged in as the tool owner
    And there is a pending borrow request for my tool
    When I navigate to "/da/requests"
    And I click the deny button for the pending request
    Then the request status should change to "Denied"

  Scenario: Borrower sees their outgoing requests
    Given I am logged in as a borrower
    And I have submitted a borrow request
    When I navigate to "/da/requests"
    And I click the outgoing tab
    Then I should see my borrow request in the list

  Scenario: Tool becomes unavailable after request is approved
    Given a borrow request has been approved for a tool
    When I navigate to the tool detail page
    Then I should see the on loan badge

  Scenario: Borrower cancels a pending request
    Given I am logged in as a borrower
    And I have a pending outgoing borrow request
    When I navigate to "/da/requests"
    And I click the outgoing tab
    And I click the cancel request button
    Then the request status should change to "Cancelled"
