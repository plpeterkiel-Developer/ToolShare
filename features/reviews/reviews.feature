Feature: Reviews
  As a user of ToolShare
  I want to leave and view reviews after completed loans
  So that the community can build trust through feedback

  Background:
    Given the application is running

  Scenario: Borrower leaves a review after a completed loan
    Given I am logged in as a borrower
    And I have a completed loan that has been marked as returned
    When I navigate to "/da/requests"
    And I click the leave review button for the completed loan
    And I submit a rating and comment
    Then I should see a confirmation that the review was submitted

  Scenario: Lender leaves a review for the borrower
    Given I am logged in as the tool owner
    And a loan for my tool has been marked as returned
    When I navigate to "/da/requests"
    And I click the leave review button for the completed loan
    And I submit a rating and comment
    Then I should see a confirmation that the review was submitted

  Scenario: Cannot leave a review for an active loan
    Given I am logged in as a borrower
    And I have an active loan that has not been returned
    When I navigate to "/da/requests"
    Then I should not see the leave review button for the active loan

  Scenario: Cannot leave a duplicate review for the same loan
    Given I am logged in as a borrower
    And I have already submitted a review for a completed loan
    When I navigate to "/da/requests"
    Then I should not see the leave review button for that loan
