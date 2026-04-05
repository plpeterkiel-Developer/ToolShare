Feature: Community onboarding
  As a ToolShare user
  I want to join a community (or request a new one)
  So that I can share and borrow tools with my neighbourhood

  Background:
    Given the application is running
    And I am logged in as a registered user

  Scenario: Onboarding banner shown when user has no memberships
    Given I am not a member of any community
    When I navigate to "/da"
    Then I should see the onboarding banner

  Scenario: Search for a community by name
    Given a community called "North Park" exists
    When I navigate to "/da/onboarding"
    And I type "North" into the community search field
    Then I should see "North Park" in the search results

  Scenario: Request to join a community
    Given a community called "North Park" exists
    When I navigate to "/da/onboarding"
    And I type "North" into the community search field
    And I click "Request to join" for "North Park"
    Then my pending join request for "North Park" should appear

  Scenario: Cancel a pending join request
    Given I have a pending join request for "North Park"
    When I navigate to "/da/onboarding"
    And I click cancel on the pending request for "North Park"
    Then the pending request for "North Park" should no longer appear

  Scenario: Request a new community when none matches
    When I navigate to "/da/onboarding"
    And I type "Nowhere Village" into the community search field
    And I open the request-new-community form
    And I fill in the community name "Nowhere Village"
    And I submit the new-community form
    Then I should see a success confirmation

  Scenario: Community admin approves a join request
    Given I am a community admin of "North Park"
    And another user has requested to join "North Park"
    When I navigate to the community manage page for "North Park"
    And I approve the pending join request
    Then the request should be marked approved
    And the requester should appear in the members list

  Scenario: Soft gate blocks tool creation for users with no community
    Given I am not a member of any community
    When I attempt to create a tool
    Then the server should reject the request with a membership error
