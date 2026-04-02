Feature: GDPR - Data Privacy and User Rights
  As a user of ToolShare
  I want to exercise my data privacy rights
  So that I remain in control of my personal information

  Background:
    Given the application is running

  # --- Right to access ---

  Scenario: User can download their personal data
    Given I am logged in as a registered user
    When I navigate to "/da/gdpr"
    And I click the download my data button
    Then I should see a confirmation that my data export has been sent to my email

  # --- Right to erasure ---

  Scenario: User can request account deletion
    Given I am logged in as a registered user
    When I navigate to "/da/gdpr"
    And I click the delete my account button
    And I confirm the deletion
    Then I should see a confirmation that my account will be erased
    And I should be logged out

  Scenario: Account deletion cancels active borrow requests
    Given I am logged in as a tool owner
    And there is a pending borrow request for my tool
    When I request account deletion
    Then the pending request should be automatically cancelled

  Scenario: Deleted account data is anonymised
    Given a user has requested account erasure
    When the erasure is processed
    Then the user's personal data should be removed from the database
    And any reviews they left should show the author as anonymous

  # --- Right to rectification ---

  Scenario: User can edit their profile information
    Given I am logged in as a registered user
    When I navigate to "/da/profile"
    And I update my display name
    And I save my profile
    Then my profile should show the updated name
